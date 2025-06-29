import React from 'react';

export default function ChatbotButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-30 h-30 rounded-full bg-white border-4 border-blue-700 shadow-lg hover:shadow-xl transition"
      aria-label="Open Chatbot"
    >
      {/* Robot face SVG - new logo */}
      <svg viewBox="0 0 200 200" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
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
    </button>
  );
} 