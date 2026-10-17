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
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">English Learning AI</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{user?.username}</p>
                <p className="text-sm text-gray-400 capitalize">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Conversations</p>
                <p className="text-2xl font-bold">{progress?.total_conversations || 0}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Practice Hours</p>
                <p className="text-2xl font-bold">
                  {progress?.total_hours.toFixed(1) || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Fluency Score</p>
                <p className="text-2xl font-bold">{progress?.fluency_score || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent-green" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Streak Days</p>
                <p className="text-2xl font-bold">{progress?.streak_days || 0}</p>
              </div>
              <Award className="w-8 h-8 text-accent-yellow" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Start New Conversation */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Ready to practice?</h2>
              <button
                onClick={startNewConversation}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4"
              >
                <Plus className="w-5 h-5" />
                Start New Conversation
              </button>
            </div>

            {/* Recent Conversations */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Conversations</h2>
              <div className="space-y-3">
                {conversations.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No conversations yet. Start your first one!
                  </p>
                ) : (
                  conversations.slice(0, 5).map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => navigate(`/conversation/${conv.id}`)}
                      className="bg-dark-surface p-4 rounded-lg border border-dark-border hover:border-primary-600 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{conv.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            conv.is_active
                              ? 'bg-accent-green/20 text-accent-green'
                              : 'bg-dark-card text-gray-400'
                          }`}
                        >
                          {conv.is_active ? 'Active' : 'Completed'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{conv.topic}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(conv.started_at).toLocaleDateString()}
                      </p>
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
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold">Learning Plan</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {learningPlan.focus_areas.map((area, idx) => (
                        <span
                          key={idx}
                          className="bg-primary-600/20 text-primary-400 text-xs px-3 py-1 rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Next Topics</p>
                    <ul className="space-y-2">
                      {learningPlan.next_topics.slice(0, 3).map((topic, idx) => (
                        <li
                          key={idx}
                          className="text-sm flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/progress')}
                  className="btn-secondary w-full text-left flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  View Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
