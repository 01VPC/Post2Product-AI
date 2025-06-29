import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

export default function ChatbotWindow({ onClose }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hello! I'm Ava, your personal assistant here to help." }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    setSending(true);
    try {
      const res = await axios.post('/api/chatbot', { message: input });
      setMessages(msgs => [...msgs, { from: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Sorry, something went wrong.' }]);
    }
    setInput('');
    setSending(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 w-[420px] max-w-[98vw] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col" style={{ minHeight: 540 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-700 rounded-t-xl">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-2">
            {/* Bot face - new SVG */}
            <svg viewBox="0 0 200 200" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="75" fill="#2d54cb" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.2))" />
              <ellipse cx="100" cy="100" rx="55" ry="50" fill="white" />
              <path d="M 70,95 Q 75,85 85,95" stroke="#2d54cb" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 115,95 Q 120,85 130,95" stroke="#2d54cb" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 85,115 Q 100,125 115,115" stroke="#2d54cb" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 23,100 C 23,80 33,70 43,70 L 43,130 C 33,130 23,120 23,100 Z" fill="#2d54cb" />
              <rect x="43" y="80" width="10" height="40" rx="2" ry="2" fill="#2d54cb" />
              <path d="M 177,100 C 177,80 167,70 157,70 L 157,130 C 167,130 177,120 177,100 Z" fill="#2d54cb" />
              <rect x="147" y="80" width="10" height="40" rx="2" ry="2" fill="#2d54cb" />
              <path d="M 43,75 Q 100,30 157,75" stroke="#2d54cb" strokeWidth="12" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">Ava Assistant</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-800 transition">
          <span className="text-white text-2xl">&times;</span>
        </button>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50" style={{ minHeight: 300, maxHeight: 400 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-lg ${msg.from === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {/* Input */}
      <div className="flex items-center px-4 py-3 border-t border-gray-200 bg-white rounded-b-xl">
        <input
          className="flex-1 rounded-full border border-gray-300 px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={sending}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white hover:bg-blue-800 transition"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
            <polygon points="3,17 17,10 3,3 3,8 13,10 3,12" fill="white" />
          </svg>
        </button>
      </div>
    </div>
  );
} 