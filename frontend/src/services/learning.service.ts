import { api } from './api';
import type { LearningPlan, UserProgress } from '@/types';

export const learningService = {
  async getLearningPlan(): Promise<LearningPlan> {
    const response = await api.get<LearningPlan>('/users/learning-plan');
    return response.data;
  },

  async refreshLearningPlan(): Promise<LearningPlan> {
    const response = await api.post<LearningPlan>('/users/learning-plan/refresh');
    return response.data;
  },

  async getProgress(): Promise<UserProgress> {
    const response = await api.get<UserProgress>('/progress');
    return response.data;
  },

  async assessLevel(responses: string[]): Promise<any> {
    const response = await api.post('/users/assess', { responses });
    return response.data;
  },
};
