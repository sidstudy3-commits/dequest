import React, { createContext, useState, useContext } from 'react';
import { fetchAPI } from '../utils/api';

const AIContext = createContext(null);

export const AIProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: 'Hi! I am your **DevQuest AI Mentor**. How can I help you in your development journey today? I can suggest project ideas, draft study roadmaps, explain complex concepts, or review code snippets.'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = { role: 'user', content };
    
    // Optimistically update message history
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Send chat history without the current user message (since backend appends or handles history)
      const data = await fetchAPI('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          prompt: content,
          history: messages.slice(1) // skip the initial greeting
        })
      });

      const aiMessage = { role: 'model', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
      return data.response;
    } catch (err) {
      console.error('[AI Context] Error sending message:', err);
      const errorMessage = {
        role: 'model',
        content: 'Sorry, I encountered an error connecting to the AI helper. Please check that the server is active and the `GEMINI_API_KEY` is configured in `backend/.env`.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        content: 'Chat history cleared. How can I assist you with your learning goals now?'
      }
    ]);
  };

  return (
    <AIContext.Provider value={{ messages, loading, sendMessage, clearChat }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);
