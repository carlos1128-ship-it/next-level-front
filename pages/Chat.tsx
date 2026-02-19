import React, { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../types";
import { SendIcon, UserIcon } from "../components/icons";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";
import { EmptyState } from "../components/AsyncState";
import { chatWithAi } from "../src/services/endpoints";

const TypingIndicator = () => (
  <div className="flex items-center space-x-1 p-2">
    <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "0s" }} />
    <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "0.2s" }} />
    <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "0.4s" }} />
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
      text: `Ola ${username || "usuario"}! Posso ajudar com a analise dos seus dados.`,
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

  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:h-[calc(100vh-40px)] dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Chat IA</h1>
        <button
          onClick={() => setMessages([])}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          type="button"
        >
          Limpar
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {safeMessages.length === 0 ? (
          <EmptyState
            title="Conversa vazia"
            description="Envie uma pergunta para iniciar o chat com a IA."
          />
        ) : (
          safeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-300 to-lime-500 text-xs font-bold text-zinc-900">
                  AI
                </div>
              ) : null}
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-md md:max-w-[70%] ${
                  msg.sender === "user"
                    ? "rounded-br-none bg-gradient-to-br from-lime-300 to-lime-400 text-zinc-900"
                    : "rounded-bl-none bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.text}</p>
              </div>
              {msg.sender === "user" ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-300 dark:bg-zinc-700">
                  <UserIcon className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                </div>
              ) : null}
            </div>
          ))
        )}
        {isTyping ? (
          <div className="flex items-start justify-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-300 to-lime-500 text-xs font-bold text-zinc-900">
              AI
            </div>
            <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <TypingIndicator />
            </div>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Digite sua mensagem..."
            className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-5 pr-14 text-zinc-900 transition focus:border-lime-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isTyping}
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-lime-300 text-zinc-900 transition hover:opacity-90 disabled:opacity-50"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
