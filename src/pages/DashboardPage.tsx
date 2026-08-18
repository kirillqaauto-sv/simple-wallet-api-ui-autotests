import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Transaction } from '../types';
import { Card, Button, Input } from '../components/UI';
import { TrendingUp, TrendingDown, Clock, Plus, Search, Filter, X } from 'lucide-react';

export default function DashboardPage({ user, onUpdate }: { user: User, onUpdate: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (category) query.append('category', category);
      if (type) query.append('type', type);

      const res = await fetch(`/api/transactions?${query.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, type]);

  const handleTopup = async () => {
    try {
      const res = await fetch('/api/user/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: 500 })
      });
      if (res.ok) {
        onUpdate();
        fetchTransactions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const categories = ['general', 'food', 'transport', 'entertainment', 'shopping', 'other'];

  return (
    <div className="dashboard-page space-y-10">
      <header className="dashboard-header flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="welcome-text">
          <h2 className="greeting text-3xl font-bold text-white mb-2">Привет, {user.username}!</h2>
          <p className="description text-zinc-500">Ваш финансовый отчет готов.</p>
        </div>
        <Button id="topup-button" onClick={handleTopup} className="topup-action bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
          <Plus className="mr-2 h-4 w-4" /> Пополнить на 500
        </Button>
      </header>

      <div className="main-stats grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="balance-summary p-8 bg-gradient-to-br from-blue-600/20 to-transparent border-blue-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <TrendingUp size={80} />
          </div>
          <p className="label text-sm text-blue-400 font-medium mb-2">Общий баланс</p>
          <div className="amount-wrapper flex items-baseline gap-3">
            <span className="balance-value text-5xl font-bold text-white tracking-tight">{user.balance}</span>
            <span className="currency-label text-zinc-500 font-semibold text-lg">RUB</span>
          </div>
        </Card>
      </div>

      <div className="transactions-section space-y-6">
        <div className="controls-header flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="section-title text-xl font-semibold text-white flex items-center gap-2">
            <Clock className="text-zinc-500" size={20} />
            История операций
          </h3>
          
          <div className="actions flex items-center gap-3 w-full sm:w-auto">
            <div className="search-box relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                id="transaction-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по описанию..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              id="toggle-filters"
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-btn p-2 rounded-lg border transition-all ${showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="filters-panel overflow-hidden"
            >
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-wrap gap-4">
                <div className="filter-group">
                  <label className="block text-xs text-zinc-500 mb-1">Категория</label>
                  <select
                    id="category-filter"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Все категории</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="block text-xs text-zinc-500 mb-1">Тип</label>
                  <select
                    id="type-filter"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Все типы</option>
                    <option value="sent">Исходящие</option>
                    <option value="received">Входящие</option>
                  </select>
                </div>
                <button
                  id="reset-filters"
                  onClick={() => { setCategory(''); setType(''); setSearch(''); }}
                  className="reset-btn text-xs text-zinc-500 hover:text-white flex items-center gap-1 mt-auto pb-2"
                >
                  <X size={14} /> Сбросить
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="transactions-table-container overflow-hidden border-zinc-800">
          <div className="overflow-x-auto">
            <table id="transactions-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-800">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Тип</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Описание</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Категория</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Дата</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">Загрузка...</td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">Операций не найдено</td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="transaction-row hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`status-badge inline-flex p-1.5 rounded-full ${t.senderId === user.id ? "text-red-400 bg-red-400/10" : "text-emerald-400 bg-emerald-400/10"}`}>
                          {t.senderId === user.id ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="description font-medium text-white truncate max-w-[200px]">
                          {t.description || (t.senderId === user.id ? 'Перевод' : 'Пополнение')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="category-tag text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {new Date(t.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${t.senderId === user.id ? "text-red-400" : "text-emerald-400"}`}>
                        {t.senderId === user.id ? '-' : '+'}{t.amount} ₽
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
