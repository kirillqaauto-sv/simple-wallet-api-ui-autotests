import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import { Card, Button, Input } from '../components/UI';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TransferPage({ user, onUpdate }: { user: User, onUpdate: () => void }) {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = ['general', 'food', 'transport', 'entertainment', 'shopping', 'other'];

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          receiverUsername: receiver,
          amount: parseFloat(amount),
          description,
          category
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Перевод успешно выполнен!' });
        setReceiver('');
        setAmount('');
        setDescription('');
        setCategory('general');
        onUpdate();
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка перевода' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Ошибка соединения' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-page max-w-2xl mx-auto">
      <h2 className="page-title text-3xl font-bold text-white mb-8">Перевод средств</h2>

      <Card className="transfer-card p-8">
        <form id="transfer-form" onSubmit={handleTransfer} className="space-y-6">
          <div className="form-group space-y-2">
            <label className="text-sm font-medium text-zinc-400">Получатель (Имя пользователя)</label>
            <Input
              id="transfer-receiver"
              name="receiver"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="ivan_ivanov"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group space-y-2">
              <label className="text-sm font-medium text-zinc-400">Сумма (RUB)</label>
              <Input
                id="transfer-amount"
                name="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                required
              />
              <p className="available-info text-xs text-zinc-500">Доступно: <span className="balance-value">{user.balance}</span> ₽</p>
            </div>

            <div className="form-group space-y-2">
              <label className="text-sm font-medium text-zinc-400">Категория</label>
              <select
                id="transfer-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group space-y-2">
            <label className="text-sm font-medium text-zinc-400">Сообщение (необязательно)</label>
            <Input
              id="transfer-comment"
              name="comment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="На кофе"
            />
          </div>

          {message.text && (
            <motion.div
              id="transfer-status-message"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`status-message p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-medium">{message.text}</span>
            </motion.div>
          )}

          <Button
            id="transfer-submit-btn"
            type="submit"
            disabled={loading}
            className="submit-button w-full py-6 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Обработка...' : (
              <div className="flex items-center gap-2 justify-center">
                <Send size={18} />
                Отправить перевод
              </div>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
