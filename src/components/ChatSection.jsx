import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';
import { getInitialMessage, getParentResponse } from '../utils/chat';

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

// Utility to remove emojis from a string
function removeEmojis(str) {
  // This regex covers most common emojis and symbols
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

const ChatSection = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeChat = async () => {
      const greeting = await getInitialMessage();
      setMessages([{ content: greeting, isUser: false }]);
    };
    initializeChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    console.log('Sending message:', message);
    setError(null);
    
    setMessages(prev => [...prev, { content: message, isUser: true }]);
    setIsLoading(true);
    setStreamingMessage('');

    try {
      let fullResponse = '';
      
      const response = await getParentResponse(message, false, (chunk) => {
        if (chunk) {
          console.log('Received chunk:', chunk);
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        }
      });

      console.log('Full response received:', fullResponse);
      
      if (!fullResponse) {
        throw new Error('No response received from the AI');
      }
      
      setMessages(prev => [...prev, { content: fullResponse, isUser: false }]);
      setStreamingMessage('');
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage = error.message || 'Sorry, I encountered an error. Please try again.';
      setError(errorMessage);
      setMessages(prev => [...prev, { 
        content: errorMessage,
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto">
      <h2 className="text-center text-lg font-medium mb-4 dark:text-white">Chat with AI for parenting advice:</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="bg-neutral-50 rounded-lg p-6 min-h-[500px] max-h-[600px] overflow-y-auto mb-4 dark:bg-neutral-800 dark:border dark:border-neutral-700 flex flex-col gap-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`
              flex ${message.isUser ? 'justify-end' : 'justify-start'}
            `}
          >
            <div
              className={`
                max-w-[80%] px-4 py-3 rounded-2xl shadow
                ${message.isUser
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white text-gray-900 dark:bg-neutral-700 dark:text-white border border-gray-200 dark:border-neutral-600 rounded-bl-md'
                }
                transition-all duration-150
                hover:shadow-lg
              `}
              style={{
                borderTopLeftRadius: message.isUser ? '1.5rem' : '0.5rem',
                borderTopRightRadius: message.isUser ? '0.5rem' : '1.5rem',
              }}
              title={!message.isUser ? 'Click to listen' : undefined}
              onClick={
                !message.isUser
                  ? () => speakText(message.content)
                  : undefined
              }
            >
              <div className="whitespace-pre-line">{message.content}</div>
              {/* Optional timestamp */}
              {/* <div className="text-xs text-gray-400 mt-1 text-right">{formatTime(message.timestamp)}</div> */}
            </div>
          </div>
        ))}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-3 rounded-2xl shadow bg-white text-gray-900 dark:bg-neutral-700 dark:text-white border border-gray-200 dark:border-neutral-600 animate-pulse">
              {streamingMessage}
              <span className="animate-pulse">▋</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </section>
  );
};

export default ChatSection;