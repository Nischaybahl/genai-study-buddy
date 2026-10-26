import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, Send, Trash2, Bot, User } from 'lucide-react';
import { api } from '../utils/api.js';
import { DemoNotice, LiveNotice, ErrorAlert } from '../components/SharedComponents.jsx';

const SUGGESTED_TOPICS = [
  'Explain the water cycle',
  'What is natural selection?',
  'How does photosynthesis work?',
  'Explain Newton\'s laws of motion',
  'What is the difference between mitosis and meiosis?',
  'Explain supply and demand',
];

export default function StudyChat({ demoMode }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMsg = { role: 'user', content: messageText.trim() };
    const updatedHistory = [...messages, userMsg];

    setMessages(updatedHistory);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const data = await api.chat(
        messageText.trim(),
        messages.map((m) => ({ role: m.role, content: m.content }))
      );

      setMessages([
        ...updatedHistory,
        { role: 'ai', content: data.reply, isDemo: data.demoMode },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to get a response. Please try again.');
      setMessages(updatedHistory); // Rollback user message on error
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    inputRef.current?.focus();
  };

  return (
    <div>
      {demoMode !== null && (demoMode ? <DemoNotice /> : <LiveNotice />)}

      <div className="card">
        <div className="card-header">
          <div className="card-icon accent">
            <MessageCircle size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 className="card-title">Study Chat</h2>
                <p className="card-description">
                  Ask your AI tutor anything. Get clear, student-friendly explanations on any topic.
                </p>
              </div>
              {messages.length > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={clearChat}
                  title="Clear conversation"
                >
                  <Trash2 size={15} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="chat-container">
          {/* Messages */}
          <div className="chat-messages" style={{ background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
            {messages.length === 0 && !loading && (
              <div style={{ padding: '24px 0' }}>
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Bot size={24} />
                  </div>
                  <h3>Start a conversation</h3>
                  <p>Ask me anything about your studies. I'm here to explain concepts, answer questions, and help you learn.</p>
                </div>

                {/* Suggested topics */}
                <div style={{ marginTop: 24, padding: '0 4px' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, textAlign: 'center' }}>
                    Try asking about...
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {SUGGESTED_TOPICS.map((t) => (
                      <button
                        key={t}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 12 }}
                        onClick={() => sendMessage(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble-wrap ${msg.role}`}>
                <div className={`chat-avatar ${msg.role}`}>
                  {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`chat-bubble ${msg.role}`}>
                  {msg.role === 'ai' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                  {msg.isDemo && (
                    <span className="chip chip-demo" style={{ marginTop: 8, display: 'inline-flex' }}>Demo</span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-wrap ai">
                <div className="chat-avatar ai">
                  <Bot size={16} />
                </div>
                <div className="chat-bubble ai">
                  <div className="chat-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <ErrorAlert message={error} />
            <div className="chat-input-row">
              <textarea
                ref={inputRef}
                id="chat-input"
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a study question... (Enter to send, Shift+Enter for new line)"
                rows={1}
                maxLength={2000}
                disabled={loading}
              />
              <button
                id="chat-send-btn"
                className="chat-send-btn"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                {loading ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', width: 18, height: 18, borderWidth: 2.5 }} /> : <Send size={18} />}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 8, textAlign: 'center' }}>
              {messages.length} message{messages.length !== 1 ? 's' : ''} in this session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
