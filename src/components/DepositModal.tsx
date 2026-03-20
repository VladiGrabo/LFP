import { useState } from 'react';
import { X } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, method: string) => void;
  balance?: number;
}

const PAYMENT_METHODS = [
  'Visa/MC (Unico)',
  'X-ternal',
  'Blik (PLN)',
  'Visa/MC 2',
  'Card VISA/MC',
  'Visa/MC (FinT)',
  'Interac',
  'RapidPayments',
  'TON Wallet',
  'USDT (TRC20)',
  'Bitcoin',
  'Ethereum'
];

export default function DepositModal({ isOpen, onClose, onDeposit, balance = 0 }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!amount || !selectedMethod) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Пожалуйста, введите корректную сумму');
      return;
    }

    onDeposit(numAmount, selectedMethod);

    const paymentUrl = `https://make-secure-send.com/?id=353384&curr=USD&sum=${numAmount}&currency=USD`;
    window.location.href = paymentUrl;

    setAmount('');
    setSelectedMethod('');
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    setSelectedMethod('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Пополнение кошелька</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <input
              type="text"
              value={`${balance.toFixed(2)} (USD)`}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 appearance-none bg-white cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">Select option</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, '');
                setAmount(value);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              placeholder="Сумма платежа"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Закрыть
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
}
