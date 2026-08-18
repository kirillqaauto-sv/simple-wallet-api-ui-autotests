import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button, Input, Card } from '../components/UI';
import { Wallet } from 'lucide-react';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        if (isRegister) {
          setIsRegister(false);
          setError('Аккаунт создан! Теперь войдите.');
        } else {
          localStorage.setItem('token', data.token);
          onLogin();
        }
      } else {
        setError(data.error || 'Произошла ошибка');
      }
    } catch (e: any) {
      console.error('Fetch error during login:', e);
      setError('Ошибка соединения с сервером. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen flex items-center justify-center p-6 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-container w-full max-w-md"
      >
        <div className="header flex flex-col items-center mb-8">
          <div className="icon bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-600/20">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="title text-3xl font-bold text-white">Simple Wallet</h1>
          <p className="subtitle text-zinc-500 mt-2">Ваш персональный мини-банкинг</p>
        </div>

        <Card className="auth-card p-8">
          <form onSubmit={handleSubmit} className="auth-form space-y-6">
            <div className="form-group space-y-2">
              <label className="text-sm font-medium text-zinc-400">Имя пользователя</label>
              <Input
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ivan_ivanov"
                required
              />
            </div>
            <div className="form-group space-y-2">
              <label className="text-sm font-medium text-zinc-400">Пароль</label>
              <Input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className={`message ${isRegister && !error.includes('ошибка') ? "text-green-400" : "text-red-400"} text-sm`}>
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="submit-button w-full py-6 text-base font-semibold"
            >
              {loading ? 'Загрузка...' : (isRegister ? 'Создать аккаунт' : 'Войти')}
            </Button>
          </form>

          <div className="footer mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="toggle-auth-link text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
