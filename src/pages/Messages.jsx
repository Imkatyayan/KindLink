import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getUserById } from '../services/api';

export default function Messages() {
  const { user } = useAuth();
  const { getConversations, getConversation, postMessage } = useData();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    const convs = await getConversations();
    setConversations(convs);
    return convs;
  }, [getConversations]);

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  useEffect(() => {
    const partnerId = searchParams.get('user');
    if (partnerId) setSelectedPartner(partnerId);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedPartner) return;
    getUserById(selectedPartner).then(setPartner);
    getConversation(selectedPartner).then(setMessages);
  }, [selectedPartner, getConversation]);

  const handleSend = async (partnerId, content) => {
    setSending(true);
    try {
      await postMessage(partnerId, content);
      const updated = await getConversation(partnerId);
      setMessages(updated);
      await loadConversations();
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading messages..." />;

  return (
    <div className="page container">
      <div className="page-header">
        <h1>Messages</h1>
        <p>Private one-to-one communication with matched users.</p>
      </div>

      <div className="messages-layout">
        <aside className="conversation-list card">
          <h3>Conversations</h3>
          {conversations.length === 0 ? (
            <p className="empty-state">No conversations yet.</p>
          ) : (
            <ul>
              {conversations.map(({ partnerId, partner: p, lastMessage }) => (
                <li key={partnerId}>
                  <button
                    type="button"
                    className={`conversation-item ${selectedPartner === partnerId ? 'active' : ''}`}
                    onClick={() => setSelectedPartner(partnerId)}
                  >
                    <div className="conv-avatar">{p?.fullName?.charAt(0)}</div>
                    <div>
                      <strong>{p?.fullName}</strong>
                      <span>{lastMessage?.content?.slice(0, 35) || 'Start chatting'}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="chat-panel card">
          {selectedPartner && partner ? (
            <ChatWindow
              currentUserId={user.id}
              partner={partner}
              messages={messages}
              onSend={handleSend}
              sending={sending}
            />
          ) : (
            <div className="empty-state page-center">Select a conversation to start messaging.</div>
          )}
        </div>
      </div>
    </div>
  );
}
