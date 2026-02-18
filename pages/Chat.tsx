import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon, UserIcon } from '../components/icons';
import { useAuth } from '../App';
import { api } from '../services/api';

const TypingIndicator = () => (
    <div className="flex items-center space-x-1 p-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const Chat = () => {
    const { username } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    useEffect(() => {
        setIsTyping(true);
        const timer = setTimeout(() => {
            setMessages([
                {
                    id: 1,
                    text: `Ola ${username}! Posso ajudar com a analise dos seus dados de vendas.`,
                    sender: 'ai',
                },
            ]);
            setIsTyping(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, [username]);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const userInput = input;
        setMessages((prev) => [...prev, { id: Date.now(), text: userInput, sender: 'user' }]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await api.post('/ai/chat', {
                message: userInput,
            });

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: String(response.data ?? ''),
                    sender: 'ai',
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: 'Nao foi possivel responder agora. Tente novamente.',
                    sender: 'ai',
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleClear = () => {
        setMessages([]);
    };

    const handleSummary = () => {
        alert('Resumo da conversa gerado! (simulado)');
    };

    return (
        <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-40px)] flex flex-col bg-black">
            <header className="p-4 border-b border-gray-800/50 flex justify-between items-center">
                <h1 className="text-xl font-bold">Chat IA</h1>
                <div className="space-x-2">
                    <button onClick={handleSummary} className="text-sm text-gray-400 hover:text-white">Gerar resumo</button>
                    <button onClick={handleClear} className="text-sm text-gray-400 hover:text-white">Limpar</button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C5FF00] to-green-500 flex items-center justify-center font-bold text-black text-xs shrink-0">AI</div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-md ${msg.sender === 'user' ? 'bg-gradient-to-br from-[#c5ff00] to-[#9fcc00] text-black rounded-br-none' : 'bg-[#181818] text-white rounded-bl-none'}`}>
                            <p>{msg.text}</p>
                        </div>
                        {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0"><UserIcon className="w-5 h-5 text-white" /></div>}
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C5FF00] to-green-500 flex items-center justify-center font-bold text-black text-xs shrink-0">AI</div>
                        <div className="bg-[#181818] rounded-2xl">
                            <TypingIndicator />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-800/50">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="w-full bg-[#111] border border-gray-700/50 rounded-full py-3 pl-5 pr-14 text-white focus:outline-none focus:border-[#C5FF00] transition"
                    />
                    <button onClick={sendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C5FF00] text-black w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition neon-glow">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
