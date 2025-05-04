import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaVolumeUp, FaComments, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { getParentResponse } from '../utils/chat';

// Utility to generate a simple session ID
function createSessionId() {
  return 'sess-' + Math.random().toString(36).substr(2, 9) + Date.now();
}

function getSessionList() {
  const sessions = localStorage.getItem('sessionList');
  return sessions ? JSON.parse(sessions) : [];
}

function saveSessionList(list) {
  localStorage.setItem('sessionList', JSON.stringify(list));
}

function getActiveSessionId() {
  let sessionId = localStorage.getItem('activeSessionId');
  if (!sessionId) {
    sessionId = createSessionId();
    let sessions = getSessionList();
    sessions.unshift({ id: sessionId, created: Date.now() });
    saveSessionList(sessions);
    localStorage.setItem('activeSessionId', sessionId);
  }
  return sessionId;
}

const formatDate = (timestamp) => {
  const d = new Date(timestamp);
  return d.toLocaleString();
};

// Utility to remove emojis from a string
function removeEmojis(str) {
  return str.replace(/[\p{Emoji}\u200d]+/gu, '').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83D[\uDC00-\uDE4F])/g, '').replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
}

const speakText = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const cleanText = removeEmojis(text);
  const utterance = new window.SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
};

function groupSessionsByDate(sessions) {
  const groups = {};
  sessions.forEach(session => {
    const date = new Date(session.created).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(session);
  });
  return groups;
}

// Mock API functions (replace with actual API calls)
async function getInitialMessage() {
  return "Hello! I'm your Virtual Parent. How can I help you with parenting advice today?";
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState(null);
  const [interim, setInterim] = useState('');
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      console.warn('Speech Recognition not supported by this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setMessage((prev) => prev + finalTranscript);
      setInterim(interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      let errorMsg = `Speech recognition error: ${event.error}`;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMsg = 'Microphone access denied. Please allow microphone access in browser settings.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech detected. Please try again.';
      }
      setMicError(errorMsg);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (message.trim()) {
        onSendMessage(message);
        setMessage('');
        setInterim('');
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      }
    };

    return () => {
      recognition.stop();
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [message, onSendMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      setInterim('');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    if (!isSpeechRecognitionSupported) {
      setMicError('Speech Recognition is not supported by your browser.');
      return;
    }
    const recognition = recognitionRef.current;
    if (!recognition) {
      setMicError('Speech Recognition could not be initialized.');
      return;
    }

    setMicError(null);

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        setMessage('');
        setInterim('');
        recognition.start();
        setIsRecording(true);
      } catch (error) {
        if (error.name === 'InvalidStateError') {
          console.warn('Recognition already started.');
        } else {
          console.error('Error starting speech recognition:', error);
          setMicError('Could not start microphone. Check permissions.');
          setIsRecording(false);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-background">
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message + interim}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Virtual Parent... (or use the mic)"
            className="min-h-[60px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 pr-12"
            disabled={disabled}
            aria-label="Type your message here"
          />
        </div>

        <button
          type="button"
          onClick={toggleRecording}
          className={`p-2 rounded-full border transition-colors duration-200 ${isRecording ? 'bg-red-500 text-white' : 'border-gray-300 bg-white text-neutral-700 hover:bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700'}`}
          disabled={disabled || !isSpeechRecognitionSupported}
          title={
            isSpeechRecognitionSupported
              ? isRecording
                ? 'Stop recording'
                : 'Start recording'
              : 'Speech input not supported'
          }
        >
          {!isSpeechRecognitionSupported ? (
            <span>!</span>
          ) : isRecording ? (
            <FaMicrophone size={18} />
          ) : (
            <FaMicrophone size={18} />
          )}
        </button>

        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors dark:bg-primary dark:text-white dark:hover:bg-primary-dark"
          disabled={!message.trim() || disabled}
          title="Send message"
        >
          Send
        </button>
      </div>

      {micError && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <span>!</span> {micError}
        </p>
      )}
    </form>
  );
};

const ChatSection = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionList, setSessionList] = useState(getSessionList());
  const [activeSessionId, setActiveSessionId] = useState(getActiveSessionId());
  const [renamingSessionId, setRenamingSessionId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Save a message to backend
  const saveMessage = async (msg, isUser) => {
    try {
      await axios.post('http://localhost:5000/api/chats', {
        sessionId: activeSessionId,
        message: msg,
        isUser,
      });
    } catch (err) {
      console.error('Failed to save chat:', err);
    }
  };

  // Fetch chat history for sidebar
  const fetchChatHistory = async (sessionId = activeSessionId) => {
    try {
      const res = await axios.get('http://localhost:5000/api/chats', {
        params: { sessionId }
      });
      setChatHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  // Fetch all sessions for sidebar
  useEffect(() => {
    setSessionList(getSessionList());
  }, [sidebarOpen, activeSessionId]);

  // Load messages for the active session
  useEffect(() => {
    const loadSession = async () => {
      const res = await axios.get('http://localhost:5000/api/chats', {
        params: { sessionId: activeSessionId }
      });
      if (res.data.length === 0) {
        const greeting = await getInitialMessage();
        setMessages([{ content: greeting, isUser: false }]);
        await saveMessage(greeting, false);
      } else {
        setMessages(res.data.map(m => ({ content: m.message, isUser: m.isUser })));
      }
    };
    loadSession();
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    setError(null);
    setMessages(prev => [...prev, { content: message, isUser: true }]);
    setIsLoading(true);
    setStreamingMessage('');
    await saveMessage(message, true);
    try {
      let fullResponse = '';
      const response = await getParentResponse(message, false, (chunk) => {
        if (chunk) {
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        }
      });
      if (!fullResponse) {
        throw new Error('No response received from the AI');
      }
      setMessages(prev => [...prev, { content: fullResponse, isUser: false }]);
      setStreamingMessage('');
      await saveMessage(fullResponse, false);
    } catch (error) {
      const errorMessage = error.message || 'Sorry, I encountered an error. Please try again.';
      setError(errorMessage);
      setMessages(prev => [...prev, { content: errorMessage, isUser: false }]);
      await saveMessage(errorMessage, false);
    } finally {
      setIsLoading(false);
    }
  };

  // Sidebar toggle handler
  const handleSidebarToggle = async () => {
    if (!sidebarOpen) {
      await fetchChatHistory();
    }
    setSidebarOpen(!sidebarOpen);
  };

  // Start new chat session
  const handleNewSession = () => {
    const newSessionId = createSessionId();
    let sessions = getSessionList();
    sessions.unshift({ id: newSessionId, created: Date.now() });
    saveSessionList(sessions);
    localStorage.setItem('activeSessionId', newSessionId);
    setActiveSessionId(newSessionId);
    setMessages([]);
    setChatHistory([]);
  };

  // Switch to a session from sidebar
  const handleSessionSelect = (id) => {
    localStorage.setItem('activeSessionId', id);
    setActiveSessionId(id);
    setSidebarOpen(false);
  };

  // Rename a session
  const handleRenameSession = (id, name) => {
    let sessions = getSessionList();
    sessions = sessions.map(s => s.id === id ? { ...s, name } : s);
    saveSessionList(sessions);
    setSessionList(sessions);
    setRenamingSessionId(null);
    setRenameValue('');
  };

  // Delete a session (with confirmation)
  const handleDeleteSession = (id) => {
    setConfirmDeleteId(id);
  };
  
  const confirmDelete = (id) => {
    let sessions = getSessionList().filter(s => s.id !== id);
    saveSessionList(sessions);
    setSessionList(sessions);
    setConfirmDeleteId(null);
    // If deleting the active session, switch to the next or create new
    if (id === activeSessionId) {
      if (sessions.length > 0) {
        localStorage.setItem('activeSessionId', sessions[0].id);
        setActiveSessionId(sessions[0].id);
      } else {
        handleNewSession();
      }
    }
  };

  return (
    <section className="max-w-4xl mx-auto relative">
      <h2 className="text-center text-lg font-medium mb-4 dark:text-white">Chat with AI for parenting advice:</h2>
      <button
        className="absolute left-0 top-0 m-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 shadow"
        onClick={handleSidebarToggle}
        title="Show chat history"
      >
        <FaComments size={22} />
      </button>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={handleSidebarToggle} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-neutral-900 shadow-lg z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}
        style={{ maxWidth: 350 }}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
          <span className="font-semibold text-lg">Chat Sessions</span>
          <button onClick={handleSidebarToggle} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">✕</button>
        </div>
        <div className="p-4">
          <button
            className="flex items-center gap-2 px-3 py-2 mb-4 rounded bg-blue-500 text-white hover:bg-blue-600 w-full justify-center"
            onClick={handleNewSession}
            title="Start new chat session"
          >
            <FaPlus /> New Chat
          </button>
          <div className="overflow-y-auto h-[calc(100vh-160px)] space-y-2">
            {sessionList.length === 0 ? (
              <div className="text-gray-400 text-center mt-8">No sessions yet.</div>
            ) : (
              Object.entries(groupSessionsByDate(sessionList)).map(([date, sessions]) => (
                <div key={date}>
                  <div className="text-xs text-gray-500 font-semibold mb-1 mt-2">{date}</div>
                  {sessions.map((session) => (
                    <div key={session.id} className={`flex items-center gap-2 mb-1 py-1 px-1 rounded-lg transition-all ${session.id === activeSessionId ? 'bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500' : 'hover:bg-gray-100 dark:hover:bg-neutral-800'}`}>
                      {renamingSessionId === session.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            className="flex-1 px-2 py-1 rounded border-2 border-blue-400 focus:border-blue-600 outline-none text-sm bg-white dark:bg-neutral-900"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            autoFocus
                            placeholder="Session name"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRenameSession(session.id, renameValue.trim());
                              } else if (e.key === 'Escape') {
                                setRenamingSessionId(null);
                              }
                            }}
                          />
                          <button 
                            className="text-green-600 hover:text-green-800 p-1"
                            onClick={() => handleRenameSession(session.id, renameValue.trim())}
                          >
                            <FaCheck />
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-700 p-1"
                            onClick={() => setRenamingSessionId(null)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            className={`flex-1 text-left px-3 py-2 rounded-lg border ${session.id === activeSessionId ? 'bg-blue-100 border-blue-400 text-blue-900 font-semibold dark:bg-blue-800 dark:text-white' : 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-neutral-800 dark:text-white'}`}
                            onClick={() => handleSessionSelect(session.id)}
                          >
                            <div className="font-semibold text-base truncate">
                              {session.name || `Session ${session.id.slice(-4)}`}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-300">
                              {formatDate(session.created)}
                            </div>
                          </button>
                          <button
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-white p-1"
                            onClick={() => {
                              setRenamingSessionId(session.id);
                              setRenameValue(session.name || '');
                            }}
                            title="Rename session"
                          >
                            <FaEdit size={14} />
                          </button>
                          {confirmDeleteId === session.id ? (
                            <div className="flex gap-1">
                              <button
                                className="text-red-500 hover:text-red-700 p-1"
                                onClick={() => confirmDelete(session.id)}
                                title="Confirm delete"
                              >
                                <FaCheck size={14} />
                              </button>
                              <button
                                className="text-gray-500 hover:text-gray-700 p-1"
                                onClick={() => setConfirmDeleteId(null)}
                                title="Cancel delete"
                              >
                                <FaTimes size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="text-red-500 hover:text-red-700 p-1"
                              onClick={() => handleDeleteSession(session.id)}
                              title="Delete session"
                            >
                              <FaTrash size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border dark:border-neutral-700 overflow-hidden">
        <div className="h-[calc(100vh-180px)] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>Start a conversation with Virtual Parent</p>
                <p className="text-sm mt-2">Ask about parenting advice, child development, or family matters</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-neutral-800'}`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {!message.isUser && (
                    <button
                      onClick={() => speakText(message.content)}
                      className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                      title="Read aloud"
                    >
                      <FaVolumeUp size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {streamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 dark:bg-neutral-800">
                <div className="whitespace-pre-wrap">{streamingMessage}</div>
              </div>
            </div>
          )}
          {isLoading && !streamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 dark:bg-neutral-800">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </section>
  );
};

export default ChatSection;