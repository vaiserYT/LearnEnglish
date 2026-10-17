import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conversationService } from '@/services/conversation.service';
import { ArrowLeft, Send, Mic, Volume2, AlertCircle } from 'lucide-react';
import type { Conversation, Message } from '@/types';

export const ConversationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadConversation();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      const conv = await conversationService.getConversation(Number(id));
      setConversation(conv);
      setMessages(conv.messages);
    } catch (error) {
      console.error('Error loading conversation:', error);
      navigate('/dashboard');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading || !id) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setLoading(true);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await conversationService.sendMessage(Number(id), userMessage);

      // Replace temp message and add AI response
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { ...tempUserMessage, id: response.message.id - 1 },
        response.message,
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndConversation = async () => {
    if (!id || !confirm('End this conversation?')) return;

    try {
      await conversationService.endConversation(Number(id));
      navigate('/dashboard');
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    // Voice recording would be implemented here with Web Speech API
    setIsRecording(!isRecording);
  };

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold">{conversation.title}</h1>
              <p className="text-sm text-gray-400">{conversation.topic}</p>
            </div>
          </div>
          {conversation.is_active && (
            <button
              onClick={handleEndConversation}
              className="btn-secondary text-sm"
            >
              End Conversation
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="max-w-[80%]">
                <div
                  className={
                    message.role === 'user' ? 'message-user' : 'message-ai'
                  }
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => speakText(message.content)}
                      className="mt-2 text-xs text-gray-400 hover:text-primary-400 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      Listen
                    </button>
                  )}
                </div>

                {/* Corrections */}
                {message.corrections && message.corrections.length > 0 && (
                  <div className="mt-2 bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-accent-yellow flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        {message.corrections.map((correction, idx) => (
                          <div key={idx}>
                            <p className="text-accent-yellow font-medium capitalize">
                              {correction.type}:
                            </p>
                            <p className="text-gray-300">
                              <span className="line-through text-gray-500">
                                {correction.incorrect}
                              </span>{' '}
                              → <span className="text-accent-green">{correction.correct}</span>
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              {correction.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="message-ai">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {conversation.is_active && (
        <div className="bg-dark-surface border-t border-dark-border px-4 py-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-dark-card hover:bg-dark-hover border border-dark-border'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="input flex-1"
              disabled={loading}
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className="btn-primary px-6"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
