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

  const ScoreBar: React.FC<{ label: string; score: number }> = ({
    label,
    score,
  }) => (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-medium">{score.toFixed(0)}/100</span>
      </div>
      <div className="w-full bg-dark-surface rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary-600 to-primary-400 h-2 rounded-full transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Your Progress</h1>
            <p className="text-sm text-gray-400">
              Track your English learning journey
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="w-6 h-6 text-primary-600" />
                  <h3 className="font-bold">Practice Sessions</h3>
                </div>
                <p className="text-3xl font-bold">{progress?.total_conversations || 0}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {progress?.total_messages || 0} messages exchanged
                </p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-accent-green" />
                  <h3 className="font-bold">Total Practice</h3>
                </div>
                <p className="text-3xl font-bold">
                  {progress?.total_hours.toFixed(1) || 0}h
                </p>
                <p className="text-sm text-gray-400 mt-1">Speaking practice time</p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-accent-yellow" />
                  <h3 className="font-bold">Current Streak</h3>
                </div>
                <p className="text-3xl font-bold">{progress?.streak_days || 0}</p>
                <p className="text-sm text-gray-400 mt-1">Days in a row</p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-primary-600" />
                  <h3 className="font-bold">Vocabulary</h3>
                </div>
                <p className="text-3xl font-bold">{progress?.vocabulary_size || 0}</p>
                <p className="text-sm text-gray-400 mt-1">Words & expressions learned</p>
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="card">
              <h3 className="text-xl font-bold mb-6">Skills Breakdown</h3>
              <div className="space-y-6">
                <ScoreBar
                  label="Fluency"
                  score={progress?.fluency_score || 0}
                />
                <ScoreBar
                  label="Pronunciation"
                  score={progress?.pronunciation_score || 0}
                />
                <ScoreBar
                  label="Grammar"
                  score={progress?.grammar_score || 0}
                />
                <ScoreBar
                  label="Comprehension"
                  score={progress?.comprehension_score || 0}
                />
              </div>
            </div>
          </div>

          {/* Learning Plan */}
          <div className="space-y-6">
            {learningPlan && (
              <>
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Current Level</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Current</span>
                    <span className="font-bold capitalize">
                      {learningPlan.current_level.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Target</span>
                    <span className="font-bold capitalize">
                      {learningPlan.target_level.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Focus Areas</h3>
                  <div className="space-y-2">
                    {learningPlan.focus_areas.map((area, idx) => (
                      <div
                        key={idx}
                        className="bg-primary-600/10 border border-primary-600/20 rounded-lg px-4 py-3"
                      >
                        <p className="font-medium capitalize">{area}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {learningPlan.weak_points.length > 0 && (
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4">Areas to Improve</h3>
                    <ul className="space-y-2">
                      {learningPlan.weak_points.map((point, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-accent-yellow rounded-full mt-2 flex-shrink-0"></span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {learningPlan.strong_points.length > 0 && (
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4">Your Strengths</h3>
                    <ul className="space-y-2">
                      {learningPlan.strong_points.map((point, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2 flex-shrink-0"></span>
                          <span>{point}</span>
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
