import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessageAPI, getChatHistoryAPI, clearChatHistoryAPI } from '../../services/aiChat';
import { executeSafeAction, ACTION_TYPES } from '../../services/chatActionHandler';
import { depositAPI } from '../../services/wallet';
import '../../pages/Spectator/Spectator.css';
import MarkdownRenderer from '../ui/MarkdownRenderer';

export default function SpectatorChatbot() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const loadHistory = async () => {
    try {
      const data = await getChatHistoryAPI();
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load chat history", err);
      // Fallback message if error
      setMessages([
        { sender: 'AI', message: 'Xin chào! Tôi là trợ lý AI đua ngựa. Tôi có thể giúp gì cho bạn hôm nay?', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleActionConfirm = async (action) => {
    if (!action || !action.type) return;

    if (action.type === ACTION_TYPES.DEPOSIT_FUNDS) {
      const amount = action.payload?.amount || 50000;
      try {
        const res = await depositAPI(amount);
        if (res?.checkoutUrl) {
          window.location.href = res.checkoutUrl;
        } else {
          alert(`Đã khởi tạo đơn nạp ${amount.toLocaleString()} VNĐ qua PayOS thành công!`);
        }
      } catch (err) {
        alert('Lỗi tạo đơn nạp tiền: ' + (err.message || 'Thất bại'));
      }
    } else {
      executeSafeAction(action, navigate);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || text.trim() === '') return;

    if (!textToSend) setInputText('');

    // Append user message locally
    const userMsg = {
      sender: 'USER',
      message: text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await sendChatMessageAPI(text);
      let aiReply = "Xin lỗi, không thể xử lý yêu cầu.";
      let actionObj = null;

      if (typeof res === 'object' && res !== null) {
        aiReply = res.text || res.message || JSON.stringify(res);
        actionObj = res.action || null;
      } else if (typeof res === 'string') {
        try {
          const parsed = JSON.parse(res);
          aiReply = parsed.text || res;
          actionObj = parsed.action || null;
        } catch (e) {
          aiReply = res;
        }
      }

      if (actionObj) {
        executeSafeAction(actionObj, navigate);
      }
      
      const aiMsg = {
        sender: 'AI',
        message: aiReply,
        action: actionObj,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Failed to get chatbot response", err);
      const errorMsg = {
        sender: 'AI',
        message: err.message || "Unable to connect to AI server at the moment.",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch sử trò chuyện này?")) {
      try {
        await clearChatHistoryAPI();
        localStorage.removeItem('ai_threads_guest');
        setMessages([
          { sender: 'AI', message: 'Đã xóa lịch sử trò chuyện. Tôi có thể hỗ trợ gì thêm cho bạn?', createdAt: new Date().toISOString() }
        ]);
      } catch (err) {
        alert("Không thể xóa lịch sử: " + err.message);
      }
    }
  };

  const suggestions = [
    "How do I deposit funds?",
    "How do I upgrade to Horse Owner role?",
    "How do I place a bet?",
    "How long do withdrawals take?"
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '900px' }}>
      
      {/* Title */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <span className="role-badge">AI CHATBOT</span>
          <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">AI Virtual Assistant</h2>
          <p className="text-secondary small">Ask questions about operations, racing rules, deposits/withdrawals, and betting.</p>
        </div>
        <button 
          onClick={handleClearHistory} 
          className="ho-btn ho-btn-outline-danger btn-sm"
          style={{ fontSize: '11px', textTransform: 'none', padding: '6px 12px' }}
        >
          Clear Chat History
        </button>
      </div>

      {/* Chat Box */}
      <div className="chat-window">
        <div className="chat-header">
          <div className="rounded-circle overflow-hidden border border-warning me-2" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
            <img 
              src="https://images.unsplash.com/photo-1598974357801-ae6e44f80698?w=80&auto=format&fit=crop&q=80" 
              alt="Horse AI Agent" 
              className="w-100 h-100 object-fit-cover" 
            />
          </div>
          <span>AI Horse Assistant</span>
        </div>

        <div className="chat-messages-container">
          {loadingHistory ? (
            <div className="text-center my-auto">
              <div className="spinner-border spinner-border-sm text-success" role="status"></div>
              <p className="text-secondary small mt-2">Loading chat history...</p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isUser = m.sender === 'USER';
              return (
                <div 
                  key={idx}
                  className={`d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'} align-items-end gap-2 mb-2`}
                >
                  {/* AI Avatar */}
                  {!isUser && (
                    <div className="rounded-circle overflow-hidden border border-success" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                      <img 
                        src="https://images.unsplash.com/photo-1598974357801-ae6e44f80698?w=80&auto=format&fit=crop&q=80" 
                        alt="AI Avatar" 
                        className="w-100 h-100 object-fit-cover" 
                      />
                    </div>
                  )}

                  <div className={`chat-bubble ${isUser ? 'user' : 'ai'}`}>
                    <div className="message-content">
                      {isUser ? m.message : <MarkdownRenderer content={m.message} />}
                    </div>
                    {m.action && (
                      <div className="mt-2 pt-2 border-top border-secondary">
                        {m.action.type === ACTION_TYPES.DEPOSIT_FUNDS && (
                          <button 
                            type="button" 
                            className="btn btn-success btn-sm w-100 fw-bold"
                            onClick={() => handleActionConfirm(m.action)}
                          >
                            💳 Xác nhận nạp {(m.action.payload?.amount || 50000).toLocaleString()} VNĐ qua PayOS
                          </button>
                        )}
                        {m.action.type !== ACTION_TYPES.DEPOSIT_FUNDS && (
                          <button 
                            type="button" 
                            className="btn btn-primary btn-sm w-100"
                            onClick={() => handleActionConfirm(m.action)}
                          >
                            🚀 Đi tới trang / thực hiện thao tác
                          </button>
                        )}
                      </div>
                    )}
                    <div className="chat-bubble-meta">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div 
                      className="rounded-circle overflow-hidden border d-flex align-items-center justify-content-center bg-success text-white fw-bold" 
                      style={{ width: '32px', height: '32px', flexShrink: 0, fontSize: '11px' }}
                    >
                      U
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {sending && (
            <div className="d-flex justify-content-start align-items-end gap-2 mb-2">
              <div className="rounded-circle overflow-hidden border border-success" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                <img 
                  src="https://images.unsplash.com/photo-1598974357801-ae6e44f80698?w=80&auto=format&fit=crop&q=80" 
                  alt="AI Avatar" 
                  className="w-100 h-100 object-fit-cover" 
                />
              </div>
              <div className="chat-bubble ai">
                <div className="d-flex align-items-center gap-1 py-1">
                  <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
                  <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ animationDelay: '0.2s' }}></span>
                  <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Bubbles */}
        <div className="chat-suggestions">
          {suggestions.map((text, idx) => (
            <button 
              key={idx} 
              type="button" 
              onClick={() => handleSend(text)}
              className="chat-suggestion-btn"
              disabled={sending}
            >
              {text}
            </button>
          ))}
        </div>

        {/* Input area */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
          className="chat-input-container"
        >
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Type your question here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
          />
          <button 
            type="submit" 
            className="chat-send-btn"
            disabled={sending || !inputText.trim()}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>

    </div>
  );
}
