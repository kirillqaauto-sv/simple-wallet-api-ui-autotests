import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, SavingsAccount } from '../types';
import { Card, Button, Input } from '../components/UI';
import { PiggyBank, Plus, Target, Wallet, X } from 'lucide-react';

export default function SavingsPage({ user, onUpdate }: { user: User, onUpdate: () => void }) {
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  
  const [depositModal, setDepositModal] = useState<{show: boolean, accountId: number | null}>({show: false, accountId: null});
  const [depositAmount, setDepositAmount] = useState('');

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/savings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/savings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newName, target: newTarget ? parseFloat(newTarget) : null })
      });
      if (res.ok) {
        setShowModal(false);
        setNewName('');
        setNewTarget('');
        fetchAccounts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModal.accountId) return;

    try {
      const res = await fetch(`/api/savings/${depositModal.accountId}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: parseFloat(depositAmount) })
      });
      if (res.ok) {
        setDepositModal({show: false, accountId: null});
        setDepositAmount('');
        onUpdate();
        fetchAccounts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="savings-page space-y-10">
      <header className="page-header flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="header-text">
          <h2 className="title text-3xl font-bold text-white mb-2">Копилки</h2>
          <p className="subtitle text-zinc-500">Откладывайте на мечту и следите за прогрессом.</p>
        </div>
        <Button id="create-savings-btn" onClick={() => setShowModal(true)} className="create-action bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Новая копилка
        </Button>
      </header>

      <div className="savings-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-zinc-500">Загрузка...</div>
        ) : accounts.length === 0 ? (
          <div className="col-span-full py-20 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center gap-4 text-zinc-500">
            <PiggyBank size={48} className="opacity-20" />
            <p>У вас пока нет активных копилок</p>
            <Button variant="ghost" onClick={() => setShowModal(true)}>Создать первую</Button>
          </div>
        ) : (
          accounts.map(acc => {
            const progress = acc.target ? Math.min(100, (Number(acc.balance) / Number(acc.target)) * 100) : 0;
            return (
              <Card key={acc.id} className="savings-card p-6 flex flex-col gap-6 group hover:border-blue-500/50 transition-all">
                <div className="card-header flex items-start justify-between">
                  <div className="icon bg-zinc-900 p-3 rounded-xl group-hover:bg-blue-600/10 transition-colors">
                    <PiggyBank className="text-zinc-400 group-hover:text-blue-400" size={24} />
                  </div>
                  <div className="balance-info text-right">
                    <p className="amount text-2xl font-bold text-white">{acc.balance} ₽</p>
                    {acc.target && <p className="target text-xs text-zinc-500">Цель: {acc.target} ₽</p>}
                  </div>
                </div>

                <div className="card-body">
                  <h4 className="account-name font-semibold text-lg text-white mb-4">{acc.name}</h4>
                  {acc.target && (
                    <div className="progress-container space-y-2">
                      <div className="progress-bar-bg w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="progress-bar-fill h-full bg-blue-600" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="progress-stats flex justify-between text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                        <span>Прогресс</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="deposit-btn w-full bg-zinc-900 hover:bg-zinc-800 text-sm"
                  onClick={() => setDepositModal({show: true, accountId: acc.id})}
                >
                  Пополнить
                </Button>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-content w-full max-w-md"
            >
              <Card className="p-8 relative">
                <button onClick={() => setShowModal(false)} className="close-btn absolute top-4 right-4 text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
                <h3 className="modal-title text-xl font-bold text-white mb-6">Создать копилку</h3>
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="form-group space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase">Название</label>
                    <Input id="savings-name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Например: На отпуск" required />
                  </div>
                  <div className="form-group space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase">Цель (необязательно)</label>
                    <Input id="savings-target" type="number" value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="50000" />
                  </div>
                  <Button type="submit" className="submit-btn w-full py-4 bg-blue-600 hover:bg-blue-700">Создать</Button>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {depositModal.show && (
          <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-content w-full max-w-sm"
            >
              <Card className="p-8 relative">
                <button onClick={() => setDepositModal({show: false, accountId: null})} className="close-btn absolute top-4 right-4 text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
                <h3 className="modal-title text-xl font-bold text-white mb-6">Перевести в копилку</h3>
                <form onSubmit={handleDeposit} className="space-y-6">
                  <div className="form-group space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase">Сумма с основного счета</label>
                    <Input id="deposit-amount" type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="0.00" required />
                    <p className="available-text text-xs text-zinc-500">Доступно: {user.balance} ₽</p>
                  </div>
                  <Button type="submit" className="submit-btn w-full py-4 bg-blue-600 hover:bg-blue-700">Подтвердить</Button>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
