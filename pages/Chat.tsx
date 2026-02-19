import React, { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../types";
import { SendIcon, UserIcon } from "../components/icons";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";
import { chatWithAi } from "../src/services/endpoints";

const TypingIndicator = () => (
  <div className="flex items-center space-x-1 p-2">
    <div
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDelay: "0s" }}
    />
    <div
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDelay: "0.2s" }}
    />
    <div
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDelay: "0.4s" }}
    />
  </div>
);

const normalizeText = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

const Chat = () => {
  const { username, detailLevel } = useAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: `Olá ${username || "usuário"}! Posso ajudar com a análise dos seus dados.`,
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const userInput = input.trim();
    if (!userInput || isTyping) return;

    setMessages((prev) => [...prev, { id: Date.now(), text: userInput, sender: "user" }]);
    setInput("");
    setIsTyping(true);

    try {
      const data = await chatWithAi({ message: userInput, detailLevel });
      const responseText =
        typeof data === "string" ? data : data.response || data.message || "Sem resposta.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: normalizeText(responseText),
          sender: "ai",
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao consultar IA.";
      addToast(message, "error");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-40px)] flex flex-col bg-black min-h-0 overflow-hidden">
      <header className="p-4 border-b border-gray-800/50 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat IA</h1>
        <button
          onClick={() => setMessages([])}
          className="text-sm text-gray-400 hover:text-white"
          type="button"
        >
          Limpar
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "ai" ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C5FF00] to-green-500 flex items-center justify-center font-bold text-black text-xs shrink-0">
                AI
              </div>
            ) : null}
            <div
              className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl shadow-md ${
                msg.sender === "user"
                  ? "bg-gradient-to-br from-[#c5ff00] to-[#9fcc00] text-black rounded-br-none"
                  : "bg-[#181818] text-white rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.text}</p>
            </div>
            {msg.sender === "user" ? (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            ) : null}
          </div>
        ))}
        {isTyping ? (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C5FF00] to-green-500 flex items-center justify-center font-bold text-black text-xs shrink-0">
              AI
            </div>
            <div className="bg-[#181818] rounded-2xl">
              <TypingIndicator />
            </div>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800/50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Digite sua mensagem..."
            className="w-full bg-[#111] border border-gray-700/50 rounded-full py-3 pl-5 pr-14 text-white focus:outline-none focus:border-[#C5FF00] transition"
          />
          <button
            onClick={sendMessage}
            disabled={isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C5FF00] text-black w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition neon-glow disabled:opacity-50"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
