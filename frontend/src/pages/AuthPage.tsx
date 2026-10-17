import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { LogIn, UserPlus } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    native_language: 'Russian',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authService.login({
          username: formData.username,
          password: formData.password,
        });
        setAuth(response.user, response.access_token);
        navigate('/dashboard');
      } else {
        await authService.register(formData);
        const response = await authService.login({
          username: formData.username,
          password: formData.password,
        });
        setAuth(response.user, response.access_token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-pink/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-purple rounded-2xl flex items-center justify-center mx-auto shadow-glow rotate-3 hover:rotate-6 transition-transform duration-300">
              <span className="text-3xl">💬</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 gradient-text animate-slide-up">
            FluentAI
          </h1>
          <p className="text-gray-400 text-lg">
            Learn English through conversation, not grammar rules
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-green to-accent-blue border-2 border-dark-bg"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-pink border-2 border-dark-bg"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple border-2 border-dark-bg"></div>
            </div>
            <span className="text-sm text-gray-500">Join 1000+ learners</span>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex mb-6 gap-2 bg-dark-surface/50 p-1.5 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                isLogin
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              <LogIn className="inline-block w-4 h-4 mr-2" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              <UserPlus className="inline-block w-4 h-4 mr-2" />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="input w-full"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                className="input w-full"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                className="input w-full"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Native Language
                </label>
                <select
                  className="input w-full"
                  value={formData.native_language}
                  onChange={(e) =>
                    setFormData({ ...formData, native_language: e.target.value })
                  }
                >
                  <option value="Russian">Russian</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Chinese">Chinese</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
