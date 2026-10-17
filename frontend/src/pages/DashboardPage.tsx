import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { conversationService } from '@/services/conversation.service';
import { learningService } from '@/services/learning.service';
import {
  MessageCircle,
  TrendingUp,
  Target,
  LogOut,
  Plus,
  Clock,
  Award,
} from 'lucide-react';
import type { Conversation, LearningPlan, UserProgress } from '@/types';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [convs, plan, prog] = await Promise.all([
        conversationService.getConversations(),
        learningService.getLearningPlan(),
        learningService.getProgress(),
      ]);
      setConversations(convs);
      setLearningPlan(plan);
      setProgress(prog);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const startNewConversation = async () => {
    try {
      const topic = learningPlan?.next_topics[0] || 'General conversation';
      const conversation = await conversationService.createConversation({
        title: `Practice: ${topic}`,
        topic,
        exercise_type: 'conversation',
      });
      navigate(`/conversation/${conversation.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-dark-surface/80 backdrop-blur-xl border-b border-dark-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-purple rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-xl">💬</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text">FluentAI</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right px-4 py-2 bg-dark-card/50 backdrop-blur-sm rounded-xl border border-dark-border">
                <p className="font-semibold">{user?.username}</p>
                <p className="text-xs text-gray-400 capitalize">
                  {user?.level.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card animate-slide-up">
            <div>
              <p className="text-gray-400 text-sm mb-1 font-medium">Conversations</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                {progress?.total_conversations || 0}
              </p>
            </div>
            <div className="stat-card-icon">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary-400" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div>
              <p className="text-gray-400 text-sm mb-1 font-medium">Practice Hours</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-accent-blue to-primary-500 bg-clip-text text-transparent">
                {progress?.total_hours.toFixed(1) || 0}
              </p>
            </div>
            <div className="stat-card-icon">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/20 to-primary-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent-blue" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div>
              <p className="text-gray-400 text-sm mb-1 font-medium">Fluency Score</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-accent-green to-emerald-400 bg-clip-text text-transparent">
                {progress?.fluency_score || 0}
              </p>
            </div>
            <div className="stat-card-icon">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-green/20 to-emerald-400/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-green" />
              </div>
            </div>
          </div>

          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div>
              <p className="text-gray-400 text-sm mb-1 font-medium">Streak Days</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-accent-yellow to-orange-400 bg-clip-text text-transparent">
                {progress?.streak_days || 0}
              </p>
            </div>
            <div className="stat-card-icon">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-yellow/20 to-orange-400/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-accent-yellow" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Start New Conversation */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-purple/10 mb-4 animate-pulse-slow">
                  <Plus className="w-8 h-8 text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Ready to practice?</h2>
                <p className="text-gray-400">Start a conversation and improve your English</p>
              </div>
              <button
                onClick={startNewConversation}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
              >
                <Plus className="w-5 h-5" />
                Start New Conversation
              </button>
            </div>

            {/* Recent Conversations */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Conversations</h2>
                <div className="px-3 py-1 bg-primary-500/10 rounded-full text-sm text-primary-400 font-medium">
                  {conversations.length} total
                </div>
              </div>
              <div className="space-y-3">
                {conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-dark-surface flex items-center justify-center">
                      <MessageCircle className="w-10 h-10 text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-lg">No conversations yet</p>
                    <p className="text-gray-500 text-sm mt-2">Start your first conversation above!</p>
                  </div>
                ) : (
                  conversations.slice(0, 5).map((conv, idx) => (
                    <div
                      key={conv.id}
                      onClick={() => navigate(`/conversation/${conv.id}`)}
                      className="card-interactive p-4 animate-slide-up"
                      style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            conv.is_active
                              ? 'bg-gradient-to-br from-accent-green/20 to-emerald-500/10'
                              : 'bg-dark-surface'
                          }`}>
                            <MessageCircle className={`w-5 h-5 ${
                              conv.is_active ? 'text-accent-green' : 'text-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{conv.title}</h3>
                            <p className="text-sm text-gray-400">{conv.topic}</p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            conv.is_active
                              ? 'bg-accent-green/20 text-accent-green'
                              : 'bg-dark-surface text-gray-400'
                          }`}
                        >
                          {conv.is_active ? 'Active' : 'Completed'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{new Date(conv.started_at).toLocaleDateString()}</span>
                        {conv.duration_seconds > 0 && (
                          <span>• {Math.floor(conv.duration_seconds / 60)} min</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Plan */}
            {learningPlan && (
              <div className="card animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-purple/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-400" />
                  </div>
                  <h2 className="text-xl font-bold">Learning Plan</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-gray-400 mb-3 font-medium">Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {learningPlan.focus_areas.map((area, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-primary-500/20 to-accent-purple/10 border border-primary-500/30 text-primary-300 text-xs px-3 py-2 rounded-lg font-medium hover:scale-105 transition-transform"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-dark-border to-transparent"></div>

                  <div>
                    <p className="text-sm text-gray-400 mb-3 font-medium">Next Topics</p>
                    <ul className="space-y-3">
                      {learningPlan.next_topics.slice(0, 3).map((topic, idx) => (
                        <li
                          key={idx}
                          className="text-sm flex items-start gap-3 p-2 rounded-lg hover:bg-dark-surface/50 transition-colors"
                        >
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/progress')}
                  className="btn-secondary w-full text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green/20 to-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5 text-accent-green" />
                    </div>
                    <span className="font-semibold">View Progress</span>
                  </div>
                  <span className="text-gray-500 group-hover:text-primary-400 transition-colors">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
