import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatWindow({ currentUserId, partner, messages, onSend, sending }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    await onSend(partner.id, text.trim());
    setText('');
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-avatar">{partner?.fullName?.charAt(0) || '?'}</div>
        <div>
          <h3>{partner?.fullName || 'User'}</h3>
          <span className="badge capitalize">{partner?.role}</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="empty-state">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
            >
              <p>{msg.content}</p>
              <time>{new Date(msg.createdAt).toLocaleTimeString()}</time>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
