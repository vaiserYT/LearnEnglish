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
    <div className="min-h-screen flex flex-col relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-dark-surface/80 backdrop-blur-xl border-b border-dark-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-dark-hover rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-accent-purple/10 rounded-xl flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">{conversation.title}</h1>
                <p className="text-sm text-gray-400">{conversation.topic}</p>
              </div>
            </div>
          </div>
          {conversation.is_active && (
            <button
              onClick={handleEndConversation}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></span>
              End Conversation
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, idx) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-slide-up`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="max-w-[80%]">
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 ml-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-purple rounded-lg flex items-center justify-center text-xs">
                      🤖
                    </div>
                    <span className="text-xs text-gray-500 font-medium">AI Teacher</span>
                  </div>
                )}
                <div
                  className={
                    message.role === 'user' ? 'message-user' : 'message-ai'
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => speakText(message.content)}
                      className="mt-3 text-xs text-gray-400 hover:text-primary-400 flex items-center gap-1.5 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Listen
                    </button>
                  )}
                </div>

                {/* Corrections */}
                {message.corrections && message.corrections.length > 0 && (
                  <div className="mt-3 bg-gradient-to-br from-accent-yellow/10 to-orange-500/5 border border-accent-yellow/30 rounded-xl p-4 text-sm animate-slide-up backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-yellow/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-accent-yellow" />
                      </div>
                      <div className="space-y-3 flex-1">
                        {message.corrections.map((correction, idx) => (
                          <div key={idx} className="bg-dark-surface/50 rounded-lg p-3">
                            <p className="text-accent-yellow font-semibold capitalize mb-2 text-xs">
                              {correction.type}
                            </p>
                            <p className="text-gray-300 mb-2">
                              <span className="line-through text-gray-500 bg-red-500/10 px-2 py-1 rounded">
                                {correction.incorrect}
                              </span>
                              <span className="mx-2">→</span>
                              <span className="text-accent-green bg-accent-green/10 px-2 py-1 rounded font-medium">
                                {correction.correct}
                              </span>
                            </p>
                            <p className="text-gray-400 text-xs leading-relaxed">
                              💡 {correction.explanation}
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
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce"></span>
                  <span
                    className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></span>
                  <span
                    className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce"
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
        <div className="relative z-10 bg-dark-surface/80 backdrop-blur-xl border-t border-dark-border/50 px-4 py-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 ${
                isRecording
                  ? 'bg-gradient-to-br from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-glow animate-pulse'
                  : 'bg-dark-card hover:bg-dark-hover border border-dark-border'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="input w-full pr-12"
                disabled={loading}
              />
              {inputMessage.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  {inputMessage.length}
                </div>
              )}
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className="btn-primary px-6 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
