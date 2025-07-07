import React, { useState, useRef } from 'react';
import './FloatingChatbot.css';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const FloatingChatbot: React.FC = () => {
  // Minimized by default
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{from: 'ai'|'user', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = getUser();
  const chatRef = useRef<HTMLDivElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/assistant/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI assistant error');
      setMessages(msgs => [...msgs, { from: 'ai', text: data.response }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setInput('');
      setTimeout(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, 100);
    }
  };

  // Recommendations based on user role
  const getRecommendation = () => {
    if (!user) return 'Login to use the AI assistant.';
    if (user.role === 'user') return 'Try asking: "Recommend me a product for summer!"';
    if (user.role === 'store') return 'Try: "How can I improve my inventory turnover?"';
    if (user.role === 'admin') return 'Try: "Show me platform analytics."';
    return 'Ask anything!';
  };

  // Make the whole minimized bubble clickable
  const handleMinimizedClick = () => {
    if (!open) setOpen(true);
  };

  return (
    <div
      className={`floating-chatbot${open ? '' : ' minimized'}`}
      style={{ right: 32, bottom: 32, zIndex: 9999, position: 'fixed' }}
      onClick={handleMinimizedClick}
    >
      <div className="floating-chatbot-header">
        <span className="floating-chatbot-title">AI Assistant</span>
        <button
          className="floating-chatbot-minimize"
          onClick={e => {
            e.stopPropagation();
            setOpen(o => !o);
          }}
        >
          {open ? '–' : '💬'}
        </button>
      </div>
      {open && (
        <div className="floating-chatbot-body">
          <div className="floating-chatbot-messages" ref={chatRef}>
            {messages.length === 0 && (
              <div className="floating-chatbot-recommendation">{getRecommendation()}</div>
            )}
            {messages.map((msg, i) => (
              msg.from === 'ai' ? (
                <div key={i} className={`floating-chatbot-msg floating-chatbot-msg-${msg.from}`}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(msg.text, { async: false })) }}
                />
              ) : (
                <div key={i} className={`floating-chatbot-msg floating-chatbot-msg-${msg.from}`}>{msg.text}</div>
              )
            ))}
            {loading && <div className="floating-chatbot-msg floating-chatbot-msg-ai">Thinking...</div>}
            {error && <div className="floating-chatbot-error">{error}</div>}
          </div>
          <form className="floating-chatbot-form" onSubmit={handleSend}>
            <input
              type="text"
              className="floating-chatbot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={user ? 'Ask me anything...' : 'Login to use the AI assistant'}
              disabled={!user || loading}
            />
            <button type="submit" className="floating-chatbot-send" disabled={!user || loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot; 