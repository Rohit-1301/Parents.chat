import Groq from 'groq-sdk';

// Initialize Groq with enhanced configuration
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// Current supported models
const SUPPORTED_MODELS = {
  DEFAULT: 'gemma2-9b-it',
};

const DEFAULT_MODEL = SUPPORTED_MODELS.DEFAULT;
const DEFAULT_GREETING = 'Hello! I am your virtual parent assistant. How can I help you today?';
const DEFAULT_ERROR_RESPONSE = 'I\'m having trouble right now. Could you please try again? 🙏';

// Standard system prompt
const SYSTEM_PROMPT = `
You are a virtual parent assistant. Your job is to answer any question from any child as if you are their caring, supportive, and knowledgeable parent. Always respond with warmth, encouragement, and practical advice. Your answers should be clear, concise, and age-appropriate, using simple language that a child can understand. If a question is complex, break it down into easy steps or explanations. Never judge, always support, and make the child feel heard and valued. If you don't know something, be honest but reassuring. Use gentle humor when appropriate, and always end with a positive or encouraging statement. Respond in the same language as the question. Do not use emojis in your responses. Do not mention being an AI or assistant; always answer as a parent would.`;

// Health check utility
const checkAPIHealth = async () => {
  try {
    console.log('Checking API health...');
    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 1
    });
    console.log('API health check response:', response);
    console.log('GROQ KEY:', import.meta.env.VITE_GROQ_API_KEY);
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Standard response function
const generateResponse = async (messages, useReasoning = false, onStream) => {
  console.log('Generating response with messages:', messages);
  
  const systemPrompt = SYSTEM_PROMPT;
  
  // Ensure system prompt is first
  if (messages[0]?.role !== 'system') {
    messages.unshift({
      role: 'system',
      content: systemPrompt
    });
  }

  try {
    console.log('Sending request to Groq API...');
    const isStreaming = typeof onStream === 'function';
    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: useReasoning ? 300 : 150,
      ...(isStreaming ? { stream: true } : {})
    });

    console.log('Received response from Groq API:', response);

    if (isStreaming && response && typeof response[Symbol.asyncIterator] === 'function') {
      let fullResponse = '';
      for await (const chunk of response) {
        if (chunk?.choices?.[0]?.delta?.content) {
          const content = chunk.choices[0].delta.content;
          console.log('Received chunk:', content);
          fullResponse += content;
          onStream(content);
        }
      }
      console.log('Final streamed response:', fullResponse);
      return fullResponse || DEFAULT_ERROR_RESPONSE;
    }

    // Handle non-streaming response
    if (response?.choices?.[0]?.message?.content) {
      const content = response.choices[0].message.content;
      console.log('Final response content:', content);
      return content;
    }

    console.error('Unexpected response format:', response);
    return DEFAULT_ERROR_RESPONSE;
  } catch (error) {
    console.error('Error generating response:', error);
    if (error.response) {
      console.error('API Error Response:', error.response);
    }
    return DEFAULT_ERROR_RESPONSE;
  }
};

// Get initial greeting
export const getInitialMessage = async () => {
  try {
    console.log('Getting initial message...');
    if (!await checkAPIHealth()) {
      throw new Error('API service unavailable');
    }

    const greeting = await generateResponse([
      {
        role: 'user',
        content: 'Introduce yourself as a warm, supportive, and knowledgeable virtual parent assistant to a child. Do not mention Dr. Kamraan. Do not use emojis.'
      }
    ]);
    console.log('Initial greeting:', greeting);
    return greeting;
  } catch (error) {
    console.error('Initialization error:', error);
    return DEFAULT_GREETING;
  }
};

// Get response with optional reasoning
export const getParentResponse = async (userMessage, useReasoning = false, onStream, retries = 2) => {
  console.log('Getting parent response for:', userMessage);
  
  if (!userMessage.trim()) {
    console.log('Empty message received');
    return DEFAULT_ERROR_RESPONSE;
  }

  try {
    const response = await generateResponse([
      { role: 'user', content: userMessage }
    ], useReasoning, onStream);
    
    if (!response) {
      throw new Error('Empty response received');
    }
    
    console.log('Dr. Kamraan response:', response);
    return response;
  } catch (error) {
    console.error('Error getting Dr. Kamraan response:', error);
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return getDrKamraanResponse(userMessage, useReasoning, onStream, retries - 1);
    }
    return DEFAULT_ERROR_RESPONSE;
  }
};

// Handle chat history
export const getChatResponse = async (messages, useReasoning = false) => {
  try {
    console.log('Getting chat response for history:', messages);
    if (messages.length === 0) return DEFAULT_GREETING;

    const formattedMessages = messages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }));

    const response = await generateResponse(formattedMessages, useReasoning);
    console.log('Chat response:', response);
    return response;
  } catch (error) {
    console.error('Conversation error:', error);
    return DEFAULT_ERROR_RESPONSE;
  }
}; 


