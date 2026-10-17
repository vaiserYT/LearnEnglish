import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { learningService } from '@/services/learning.service';
import { ArrowLeft, TrendingUp, Target, MessageCircle, Award } from 'lucide-react';
import type { UserProgress, LearningPlan } from '@/types';

export const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prog, plan] = await Promise.all([
        learningService.getProgress(),
        learningService.getLearningPlan(),
      ]);
      setProgress(prog);
      setLearningPlan(plan);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading progress...</p>
        </div>
      </div>
    );
  }

  const ScoreBar: React.FC<{ label: string; score: number; color: string }> = ({
    label,
    score,
    color,
  }) => (
    <div className="group">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold text-primary-400">{score.toFixed(0)}/100</span>
      </div>
      <div className="w-full bg-dark-surface rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ease-out ${color} relative overflow-hidden`}
          style={{ width: `${score}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-dark-surface/80 backdrop-blur-xl border-b border-dark-border/50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-dark-hover rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-emerald-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Progress</h1>
              <p className="text-sm text-gray-400">
                Track your English learning journey
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card animate-slide-up group hover:border-primary-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="font-bold text-lg">Practice Sessions</h3>
                </div>
                <p className="text-4xl font-bold gradient-text mb-2">{progress?.total_conversations || 0}</p>
                <p className="text-sm text-gray-400">
                  {progress?.total_messages || 0} messages exchanged
                </p>
              </div>

              <div className="card animate-slide-up group hover:border-accent-green/30" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-green/20 to-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-accent-green" />
                  </div>
                  <h3 className="font-bold text-lg">Total Practice</h3>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-accent-green to-emerald-400 bg-clip-text text-transparent mb-2">
                  {progress?.total_hours.toFixed(1) || 0}h
                </p>
                <p className="text-sm text-gray-400">Speaking practice time</p>
              </div>

              <div className="card animate-slide-up group hover:border-accent-yellow/30" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-yellow/20 to-orange-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6 text-accent-yellow" />
                  </div>
                  <h3 className="font-bold text-lg">Current Streak</h3>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-accent-yellow to-orange-400 bg-clip-text text-transparent mb-2">
                  {progress?.streak_days || 0}
                </p>
                <p className="text-sm text-gray-400">Days in a row</p>
              </div>

              <div className="card animate-slide-up group hover:border-accent-purple/30" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-purple/20 to-pink-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-accent-purple" />
                  </div>
                  <h3 className="font-bold text-lg">Vocabulary</h3>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-accent-purple to-pink-400 bg-clip-text text-transparent mb-2">
                  {progress?.vocabulary_size || 0}
                </p>
                <p className="text-sm text-gray-400">Words & expressions learned</p>
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Skills Breakdown
              </h3>
              <div className="space-y-6">
                <ScoreBar
                  label="Fluency"
                  score={progress?.fluency_score || 0}
                  color="bg-gradient-to-r from-primary-600 to-primary-400"
                />
                <ScoreBar
                  label="Pronunciation"
                  score={progress?.pronunciation_score || 0}
                  color="bg-gradient-to-r from-accent-green to-emerald-400"
                />
                <ScoreBar
                  label="Grammar"
                  score={progress?.grammar_score || 0}
                  color="bg-gradient-to-r from-accent-yellow to-orange-400"
                />
                <ScoreBar
                  label="Comprehension"
                  score={progress?.comprehension_score || 0}
                  color="bg-gradient-to-r from-accent-purple to-pink-400"
                />
              </div>
            </div>
          </div>

          {/* Learning Plan */}
          <div className="space-y-6">
            {learningPlan && (
              <>
                <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Current Level
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20">
                      <span className="text-sm text-gray-400 block mb-1">Current</span>
                      <span className="font-bold text-lg capitalize text-primary-400">
                        {learningPlan.current_level.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-dark-border to-transparent"></div>
                      <span className="px-4 text-gray-500">→</span>
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-dark-border to-transparent"></div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-accent-green/10 to-transparent rounded-xl border border-accent-green/20">
                      <span className="text-sm text-gray-400 block mb-1">Target</span>
                      <span className="font-bold text-lg capitalize text-accent-green">
                        {learningPlan.target_level.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card animate-slide-up" style={{ animationDelay: '0.6s' }}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-2xl">🎓</span>
                    Focus Areas
                  </h3>
                  <div className="space-y-3">
                    {learningPlan.focus_areas.map((area, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-primary-500/10 to-accent-purple/5 border border-primary-500/20 rounded-xl px-4 py-3 hover:scale-[1.02] transition-transform"
                      >
                        <p className="font-medium capitalize">{area}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {learningPlan.weak_points.length > 0 && (
                  <div className="card animate-slide-up" style={{ animationDelay: '0.7s' }}>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <span className="text-2xl">💪</span>
                      Areas to Improve
                    </h3>
                    <ul className="space-y-3">
                      {learningPlan.weak_points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-surface/50 transition-colors">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-accent-yellow/20 text-accent-yellow flex-shrink-0 mt-0.5">
                            <span className="text-xs">!</span>
                          </span>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {learningPlan.strong_points.length > 0 && (
                  <div className="card animate-slide-up" style={{ animationDelay: '0.8s' }}>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      Your Strengths
                    </h3>
                    <ul className="space-y-3">
                      {learningPlan.strong_points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-surface/50 transition-colors">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-accent-green/20 text-accent-green flex-shrink-0 mt-0.5">
                            <span className="text-xs">✓</span>
                          </span>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
