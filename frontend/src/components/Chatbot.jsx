import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, Loader2, User, AlertCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Chatbot.css';

// The RAG service URL. Configure via VITE_RAG_URL in frontend/.env.
// This never contains an LLM API key - the key lives only in rag-service/.env.
const RAG_URL = import.meta.env.VITE_RAG_URL || 'http://localhost:8000';

// How many previous messages to send as conversation history.
const MAX_HISTORY_MESSAGES = 10;

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hi! 👋 I'm the SharePlate Assistant. I can help you with:\n\n" +
    "• How SharePlate works\n" +
    "• Current food donations & availability\n" +
    "• Your donations, claims, and pickups\n" +
    "• FAQs about registration, posting food, etc.\n\n" +
    "Just type your question below!",
};

// Quick FAQ suggestions shown as chips
const QUICK_QUESTIONS = [
  "How do I post food?",
  "What's available now?",
  "How does claiming work?",
  "My donations",
];

const Chatbot = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sources, setSources] = useState([]);
  const [serviceStatus, setServiceStatus] = useState('unknown'); // 'ok' | 'error' | 'unknown'

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Check RAG service health when chatbot is opened
  useEffect(() => {
    if (isOpen && serviceStatus === 'unknown') {
      fetch(`${RAG_URL}/health`, { signal: AbortSignal.timeout(5000) })
        .then((res) => {
          setServiceStatus(res.ok ? 'ok' : 'error');
        })
        .catch(() => {
          setServiceStatus('error');
        });
    }
  }, [isOpen, serviceStatus]);

  const togglePanel = () => setIsOpen((open) => !open);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter falls through and inserts a newline in the textarea.
  };

  const sendMessage = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    setError('');
    setSources([]);
    const userMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    // Build recent history from the conversation so far (excluding the
    // initial welcome message, which is UI-only, not a real exchange).
    const history = nextMessages
      .filter((m) => m !== WELCOME_MESSAGE)
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content }));

    const payload = {
      message: trimmed,
      page: location.pathname,
      history,
    };

    if (user) {
      payload.user = { uid: user.uid || user._id, name: user.name, role: user.role };
    }

    try {
      const res = await fetch(`${RAG_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const detail = data?.detail || 'The SharePlate Assistant is unavailable right now.';
        throw new Error(detail);
      }

      if (!data || !data.answer) {
        throw new Error('The SharePlate Assistant returned an empty response.');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
      if (data.sources && data.sources.length > 0) {
        setSources(data.sources);
      }
      setServiceStatus('ok');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      if (message.includes('unavailable') || message.includes('Failed to fetch') || message.includes('NetworkError')) {
        setServiceStatus('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleQuickQuestion = (question) => {
    if (!isLoading) {
      setInput(question);
      sendMessage(question);
    }
  };

  const showQuickQuestions = messages.length <= 1;

  return (
    <div className="chatbot-root">
      {isOpen && (
        <div className="chatbot-panel" role="dialog" aria-label="SharePlate Assistant chat">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <Bot size={20} />
              <span>SharePlate Assistant</span>
              {serviceStatus === 'ok' && <span className="chatbot-status-dot chatbot-status-ok" title="Connected" />}
              {serviceStatus === 'error' && <span className="chatbot-status-dot chatbot-status-err" title="Service unavailable" />}
            </div>
            <button
              type="button"
              className="chatbot-icon-btn"
              onClick={togglePanel}
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages" aria-live="polite">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-bubble-row ${msg.role === 'user' ? 'chatbot-bubble-row-user' : ''}`}
              >
                <div className="chatbot-avatar" aria-hidden="true">
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={`chatbot-bubble ${
                    msg.role === 'user' ? 'chatbot-bubble-user' : 'chatbot-bubble-assistant'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Quick question chips - shown only at the start */}
            {showQuickQuestions && !isLoading && (
              <div className="chatbot-quick-questions">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="chatbot-quick-btn"
                    onClick={() => handleQuickQuestion(q)}
                    disabled={isLoading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="chatbot-bubble-row">
                <div className="chatbot-avatar" aria-hidden="true">
                  <Bot size={14} />
                </div>
                <div className="chatbot-bubble chatbot-bubble-assistant chatbot-bubble-loading">
                  <Loader2 size={16} className="chatbot-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="chatbot-error" role="alert">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {sources.length > 0 && (
              <div className="chatbot-sources">
                <BookOpen size={12} />
                <span>Sources: {sources.join(', ')}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <textarea
              ref={textareaRef}
              className="chatbot-textarea"
              placeholder="Ask about SharePlate..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              aria-label="Message SharePlate Assistant"
              disabled={isLoading}
            />
            <button
              type="button"
              className="chatbot-send-btn"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="chatbot-fab"
        onClick={togglePanel}
        aria-label={isOpen ? 'Close SharePlate Assistant' : 'Open SharePlate Assistant'}
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
};

export default Chatbot;
