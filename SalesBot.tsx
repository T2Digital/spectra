import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X, Bot } from './components/icons';
import { CartContext } from './contexts/CartContext';
import type { ChatMessage, Product } from './types';
import { chatWithSalesBot } from './gemini/api';

const SalesBot: React.FC<{ allProducts: Product[] }> = ({ allProducts }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<ChatMessage[]>([
        { role: 'model', parts: [{ text: 'أهلاً بيك في سبكترا! أنا مساعدك الذكي. تقدر تسألني عن أي حاجة أو تقولي أضيفلك إيه للسلة. 😉' }] }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
    const navigate = useNavigate();

    // Auto-open logic
    useEffect(() => {
        const hasOpened = sessionStorage.getItem('salesBotAutoOpened');
        if (!hasOpened) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem('salesBotAutoOpened', 'true');
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [history]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        setInput('');
        setLoading(true);

        try {
            const response = await chatWithSalesBot(newHistory, {
                allProducts,
                cartItems,
                addToCart,
                removeFromCart,
                navigate,
            });
            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response }] };
            setHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: 'عفواً، حصلت مشكلة تقنية. ممكن تجرب تاني كمان شوية.' }] };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 left-5 z-50 bg-brand-primary text-white rounded-full p-4 shadow-xl hover:bg-opacity-90 transition-transform hover:scale-110 animate-pulse"
                aria-label="Open sales bot"
            >
               <Bot className="w-6 h-6" />
            </button>
            {isOpen && (
                <div className="fixed bottom-24 left-5 z-50 w-80 h-[28rem] bg-white rounded-lg shadow-2xl flex flex-col animate-fade-in-up">
                    <div className="bg-brand-primary text-white p-3 flex items-center justify-between gap-2 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5"/>
                            <h3 className="font-semibold">مساعد سبكترا الذكي</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} aria-label="Close sales bot">
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="flex-grow p-3 overflow-y-auto bg-gray-50">
                        {history.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                                <div className={`max-w-[80%] p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                                </div>
                            </div>
                        ))}
                         {loading && (
                            <div className="flex justify-start mb-2">
                                <div className="max-w-[80%] p-2 rounded-lg bg-gray-200 text-gray-800">
                                    <p className="text-sm animate-pulse">بيفكر...</p>
                                </div>
                            </div>
                         )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-2 border-t flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="اسألني أي حاجة..."
                            className="flex-grow border rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            disabled={loading}
                        />
                        <button onClick={handleSend} disabled={loading || !input.trim()} className="bg-brand-primary text-white p-2 rounded-full disabled:bg-gray-400">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SalesBot;