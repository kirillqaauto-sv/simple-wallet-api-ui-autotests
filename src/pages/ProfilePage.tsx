import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import { Card, Button, Input } from '../components/UI';
import { User as UserIcon, Settings, Shield, Bell, CheckCircle2 } from 'lucide-react';

export default function ProfilePage({ user, onUpdate }: { user: User, onUpdate: () => void }) {
  const [username, setUsername] = useState(user.username);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username })
      });
      if (res.ok) {
        setSuccess(true);
        onUpdate();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (e) {
      setError('Ошибка обновления');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page max-w-4xl mx-auto space-y-10">
      <header className="page-header">
        <h2 className="title text-3xl font-bold text-white mb-2">Настройки профиля</h2>
        <p className="subtitle text-zinc-500">Управляйте вашим аккаунтом и личными данными.</p>
      </header>

      <div className="profile-grid grid grid-cols-1 lg:grid-cols-3 gap-10">
        <aside className="sidebar-nav space-y-2">
          <button className="nav-item flex items-center gap-3 w-full p-4 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/20">
            <UserIcon size={20} /> Личные данные
          </button>
          <button className="nav-item flex items-center gap-3 w-full p-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all">
            <Shield size={20} /> Безопасность
          </button>
          <button className="nav-item flex items-center gap-3 w-full p-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all">
            <Bell size={20} /> Уведомления
          </button>
          <button className="nav-item flex items-center gap-3 w-full p-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all">
            <Settings size={20} /> Другие настройки
          </button>
        </aside>

        <div className="main-content lg:col-span-2 space-y-8">
          <Card className="profile-card p-8">
            <h3 className="section-title text-lg font-bold text-white mb-6">Основная информация</h3>
            <form onSubmit={handleUpdate} className="profile-form space-y-6">
              <div className="form-group space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase">Имя пользователя</label>
                <Input
                  id="profile-username-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ivanov"
                  required
                />
              </div>

              <div className="form-group space-y-2 opacity-50">
                <label className="text-xs font-medium text-zinc-500 uppercase">ID Пользователя (только чтение)</label>
                <Input id="profile-id-readonly" value={user.id} readOnly />
              </div>

              {error && <p id="profile-error-msg" className="text-red-400 text-sm">{error}</p>}
              {success && (
                <div id="profile-success-msg" className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle2 size={16} /> Профиль успешно обновлен!
                </div>
              )}

              <Button
                id="save-profile-btn"
                type="submit"
                disabled={loading}
                className="submit-action px-10 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </form>
          </Card>

          <Card className="advanced-options p-8 border-red-500/20 bg-red-500/5">
             <h3 className="section-title text-lg font-bold text-red-400 mb-2">Опасная зона</h3>
             <p className="description text-sm text-zinc-500 mb-6">Удаление аккаунта приведет к потере всех средств без возможности восстановления.</p>
             <Button id="delete-account-btn" variant="outline" className="delete-action border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white">
               Удалить аккаунт
             </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
