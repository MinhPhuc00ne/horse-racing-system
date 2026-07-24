import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRobot, FaTimes, FaTrashAlt, FaPaperPlane, FaPlus, FaHistory, FaCommentAlt, FaImage } from 'react-icons/fa';
import { BsChatDotsFill } from 'react-icons/bs';
import { sendChatMessageAPI, getChatHistoryAPI } from '../../../services/aiChat';
import { AuthContext } from '../../../contexts/AuthContext';
import './FloatingAiChat.css';
import MarkdownRenderer from '../../ui/MarkdownRenderer';

export default function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // { preview: '...', data: '...', mimeType: '...' }
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [threads, activeThreadId, isSending, isOpen]);

  // Load threads from localStorage or DB
  useEffect(() => {
    const storageKey = user ? `ai_threads_${user.id}` : 'ai_threads_guest';
    const localData = localStorage.getItem(storageKey);
    let loadedThreads = [];
    if (localData) {
      try {
        loadedThreads = JSON.parse(localData);
      } catch (e) {
        console.error(e);
      }
    }

    if (user) {
      // If logged in and no local threads, try to load from DB
      if (loadedThreads.length === 0) {
        loadDbHistory();
      } else {
        setThreads(loadedThreads);
        setActiveThreadId(loadedThreads[0].id);
      }
    } else {
      // Guest: if no local threads, create a default one
      if (loadedThreads.length === 0) {
        const welcomeText = 'Hello! You are chatting as a Guest. Please log in to save your chat history. How can I help you today?';
        const newTh = {
          id: Date.now().toString(),
          title: 'New Chat',
          messages: [{ sender: 'AI', text: welcomeText }],
          createdAt: new Date().toISOString()
        };
        setThreads([newTh]);
        setActiveThreadId(newTh.id);
        localStorage.setItem(storageKey, JSON.stringify([newTh]));
      } else {
        setThreads(loadedThreads);
        setActiveThreadId(loadedThreads[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDbHistory = async () => {
    try {
      setIsLoading(true);
      const history = await getChatHistoryAPI();
      const dbMsgs = history.map(h => ({
        sender: h.sender === 'USER' ? 'USER' : 'AI',
        text: h.message
      }));
      
      const welcomeText = 'Hello! I am your Horse Racing AI Assistant. How can I help you?';
      const defaultThread = {
        id: 'db_sync',
        title: dbMsgs.length > 0 ? (dbMsgs[0].text.substring(0, 25) + '...') : 'Synced with system',
        messages: dbMsgs.length > 0 ? dbMsgs : [{ sender: 'AI', text: welcomeText }],
        createdAt: new Date().toISOString()
      };
      
      setThreads([defaultThread]);
      setActiveThreadId(defaultThread.id);
      
      const storageKey = user ? `ai_threads_${user.id}` : 'ai_threads_guest';
      localStorage.setItem(storageKey, JSON.stringify([defaultThread]));
    } catch (error) {
      console.error('Failed to load history:', error);
      const welcomeText = user 
        ? 'Hello! I am your Horse Racing AI Assistant. How can I help you?'
        : 'Hello! You are chatting as a Guest. Please log in to save your chat history. How can I help you today?';
      
      const newTh = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [{ sender: 'AI', text: welcomeText }],
        createdAt: new Date().toISOString()
      };
      setThreads([newTh]);
      setActiveThreadId(newTh.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const welcomeText = user 
      ? 'Hello! I am your Horse Racing AI Assistant. How can I help you?'
      : 'Hello! You are chatting as a Guest. Please log in to save your chat history. How can I help you today?';
    
    const newTh = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{ sender: 'AI', text: welcomeText }],
      createdAt: new Date().toISOString()
    };
    
    const updatedThreads = [newTh, ...threads];
    setThreads(updatedThreads);
    setActiveThreadId(newTh.id);
    
    const storageKey = user ? `ai_threads_${user.id}` : 'ai_threads_guest';
    localStorage.setItem(storageKey, JSON.stringify(updatedThreads));
  };

  const handleSelectThread = (id) => {
    setActiveThreadId(id);
  };

  const handleDeleteThread = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) return;

    const updatedThreads = threads.filter(t => t.id !== id);
    const storageKey = user ? `ai_threads_${user.id}` : 'ai_threads_guest';
    
    if (updatedThreads.length === 0) {
      const welcomeText = user 
        ? 'Hello! I am your Horse Racing AI Assistant. How can I help you?'
        : 'Hello! You are chatting as a Guest. Please log in to save your chat history. How can I help you today?';
      
      const newTh = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [{ sender: 'AI', text: welcomeText }],
        createdAt: new Date().toISOString()
      };
      setThreads([newTh]);
      setActiveThreadId(newTh.id);
      localStorage.setItem(storageKey, JSON.stringify([newTh]));
    } else {
      setThreads(updatedThreads);
      if (activeThreadId === id) {
        setActiveThreadId(updatedThreads[0].id);
      }
      localStorage.setItem(storageKey, JSON.stringify(updatedThreads));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Maximum image size is 25MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      setSelectedImage({
        preview: reader.result,
        data: base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isSending || !activeThreadId) return;

    const userMessage = inputText.trim();
    const imagePayload = selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : null;
    const imagePreview = selectedImage ? selectedImage.preview : null;

    setInputText('');
    handleClearImage();

    // Create user message object for UI (with local image preview if present)
    const newUserMsg = { 
      sender: 'USER', 
      text: userMessage || 'Sent image', 
      image: imagePreview 
    };

    const currentActiveThread = threads.find(t => t.id === activeThreadId);
    if (!currentActiveThread) return;

    let newTitle = currentActiveThread.title;
    if (currentActiveThread.title === 'New Chat' || currentActiveThread.messages.length <= 1) {
      newTitle = userMessage 
        ? (userMessage.length > 22 ? userMessage.substring(0, 22) + '...' : userMessage) 
        : 'Image sent';
    }

    const updatedMessages = [...currentActiveThread.messages, newUserMsg];
    const updatedThreads = threads.map(t => {
      if (t.id === activeThreadId) {
        return { ...t, title: newTitle, messages: updatedMessages };
      }
      return t;
    });
    setThreads(updatedThreads);
    const storageKey = user ? `ai_threads_${user.id}` : 'ai_threads_guest';
    localStorage.setItem(storageKey, JSON.stringify(updatedThreads));

    setIsSending(true);

    try {
      const replyStr = await sendChatMessageAPI(userMessage || '[Image attached]', imagePayload);
      const aiReplyText = typeof replyStr === 'string' 
        ? replyStr 
        : (replyStr.text || replyStr.response || replyStr.message || JSON.stringify(replyStr));

      const newAiMsg = { sender: 'AI', text: aiReplyText };
      const finalMessages = [...updatedMessages, newAiMsg];

      const finalThreads = threads.map(t => {
        if (t.id === activeThreadId) {
          return { ...t, messages: finalMessages };
        }
        return t;
      });
      setThreads(finalThreads);
      localStorage.setItem(storageKey, JSON.stringify(finalThreads));
    } catch (error) {
      const newAiErrorMsg = { sender: 'AI', text: 'Sorry, an error occurred while connecting to the AI. Please try again later.' };
      const finalMessages = [...updatedMessages, newAiErrorMsg];
      const finalThreads = threads.map(t => {
        if (t.id === activeThreadId) {
          return { ...t, messages: finalMessages };
        }
        return t;
      });
      setThreads(finalThreads);
      localStorage.setItem(storageKey, JSON.stringify(finalThreads));
    } finally {
      setIsSending(false);
    }
  };

  const activeThread = threads.find(t => t.id === activeThreadId);
  const messages = activeThread ? activeThread.messages : [];

  const handleLoginRedirect = () => {
    setIsOpen(false);
    navigate('/login');
  };

  if (['/login', '/signup', '/verify-account', '/verify-email'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="floating-chat-container">
      {isOpen && (
        <div className={`floating-chat-window ${showHistory ? 'expanded' : ''}`}>
          
          {/* SIDEBAR: HISTORY */}
          {showHistory && (
            <div className="chat-sidebar">
              <div className="sidebar-header">
                <h5>Recent Chats</h5>
                <button className="new-chat-btn" onClick={handleNewChat} title="New Chat">
                  <FaPlus size={12} /> New
                </button>
              </div>
              <div className="threads-list">
                {threads.map((t) => (
                  <div 
                    key={t.id} 
                    className={`thread-item ${t.id === activeThreadId ? 'active' : ''}`}
                    onClick={() => handleSelectThread(t.id)}
                  >
                    <FaCommentAlt size={12} className="thread-icon" />
                    <span className="thread-title">{t.title}</span>
                    <button 
                      className="delete-thread-btn" 
                      onClick={(e) => handleDeleteThread(e, t.id)}
                      title="Delete chat"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
              </div>
              {!user && (
                <div className="sidebar-footer">
                  <p>Log in to sync history</p>
                  <button onClick={handleLoginRedirect}>Log In</button>
                </div>
              )}
            </div>
          )}

          {/* MAIN CHAT AREA */}
          <div className="chat-main">
            <div className="chat-header">
              <h4>
                <FaRobot className="header-robot-icon" /> 
                <span>AI Assistant</span>
              </h4>
              <div className="chat-header-actions">
                <button 
                  className={`chat-header-btn history-toggle-btn ${showHistory ? 'active' : ''}`} 
                  onClick={() => setShowHistory(!showHistory)}
                  title="Chat History"
                >
                  <FaHistory />
                </button>
                <button className="chat-header-btn" onClick={() => setIsOpen(false)}>
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="chat-body">
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="spinner-border text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <div key={index} className={`chat-bubble-wrapper ${msg.sender === 'USER' ? 'user' : 'ai'}`}>
                      {msg.sender === 'AI' && <div className="avatar ai-avatar"><FaRobot size={12} /></div>}
                      <div className={`chat-bubble ${msg.sender === 'USER' ? 'user' : 'ai'}`}>
                        {msg.sender === 'AI' ? (
                          <MarkdownRenderer content={msg.text} />
                        ) : (
                          msg.text && msg.text.split('\n').map((line, lIdx) => (
                            <p key={lIdx} style={{ margin: '0 0 6px 0' }}>{line}</p>
                          ))
                        )}
                        {msg.image && (
                          <img src={msg.image} alt="Sent attachment" className="chat-bubble-image" />
                        )}
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="chat-bubble-wrapper ai">
                      <div className="avatar ai-avatar"><FaRobot size={12} /></div>
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* IMAGE PREVIEW BAR */}
            {selectedImage && (
              <div className="chat-image-preview-container">
                <img src={selectedImage.preview} alt="Preview" className="chat-image-preview" />
                <button type="button" className="clear-image-preview-btn" onClick={handleClearImage} title="Remove image">
                  <FaTimes size={10} />
                </button>
              </div>
            )}

            <form className="chat-footer" onSubmit={handleSend}>
              <button 
                type="button" 
                className="chat-attach-btn" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending || isLoading}
                title="Attach image"
              >
                <FaImage size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleImageChange}
              />
              <input 
                type="text" 
                className="chat-input"
                placeholder={selectedImage ? "Ask a question about this image..." : "Ask the Horse Racing AI Assistant..."} 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending || isLoading}
              />
              <button 
                type="submit" 
                className="chat-send-btn"
                disabled={(!inputText.trim() && !selectedImage) || isSending || isLoading}
              >
                <FaPaperPlane size={14} />
              </button>
            </form>
          </div>

        </div>
      )}

      {!isOpen && (
        <button 
          className="floating-chat-button" 
          onClick={() => setIsOpen(true)}
          title="Chat with AI"
        >
          <BsChatDotsFill />
        </button>
      )}
    </div>
  );
}
