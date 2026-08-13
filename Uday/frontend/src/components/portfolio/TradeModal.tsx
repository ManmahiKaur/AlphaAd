import React, { useState } from 'react';
import { Modal, Button, Input, Badge } from '../ui/UIComponents';
import { StockQuote, TransactionTypeEnum } from '../../types';
import { portfolioApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: StockQuote;
  onTradeSuccess?: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, quote, onTradeSuccess }) => {
  const [tradeType, setTradeType] = useState<TransactionTypeEnum>('BUY');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, refetchUser } = useAuth();
  const totalCost = (quote.current_price * quantity) || 0;
  const isIndian = quote.currency === 'INR';
  const userBalance = isIndian ? user?.virtual_balance_inr || 0 : user?.virtual_balance_usd || 0;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await portfolioApi.trade({
        ticker: quote.ticker,
        transaction_type: tradeType,
        quantity: Number(quantity)
      });
      await refetchUser();
      if (onTradeSuccess) onTradeSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to execute virtual trade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Virtual Trade: ${quote.ticker}`}>
      <form onSubmit={handleTrade} className="flex flex-col gap-4">
        {/* Trade Type Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setTradeType('BUY')}
            className={`py-2 rounded-lg font-bold text-xs transition-all ${
              tradeType === 'BUY' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            BUY SHARES
          </button>
          <button
            type="button"
            onClick={() => setTradeType('SELL')}
            className={`py-2 rounded-lg font-bold text-xs transition-all ${
              tradeType === 'SELL' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            SELL SHARES
          </button>
        </div>

        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg">{error}</div>}

        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span>Current Execution Price:</span>
          <span className="font-bold text-slate-900 font-mono">{formatCurrency(quote.current_price, quote.currency)}</span>
        </div>

        <Input
          label="Quantity (Shares)"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          required
        />

        <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Total Estimated Cost:</span>
            <span className="font-bold text-slate-900 font-mono">{formatCurrency(totalCost, quote.currency)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Available Balance ({quote.currency}):</span>
            <span className="font-bold text-blue-600 font-mono">{formatCurrency(userBalance, quote.currency)}</span>
          </div>
        </div>

        <Button type="submit" variant={tradeType === 'BUY' ? 'primary' : 'danger'} disabled={loading} className="w-full mt-2">
          {loading ? 'Processing Execution...' : `Confirm Virtual ${tradeType}`}
        </Button>
      </form>
    </Modal>
  );
};
