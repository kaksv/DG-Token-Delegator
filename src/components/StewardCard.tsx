import React, { useState } from 'react';
import { Vote, TrendingUp, CheckCircle, Info } from 'lucide-react';
import { Steward } from '../types';
import { useDelegation } from '../hooks/useDelegation';

interface StewardCardProps {
  steward: Steward;
  onDelegate: (address: string, name: string, amount?: string) => void;
  isCurrentDelegate: boolean;
  isLoading: boolean;
}

export const StewardCard: React.FC<StewardCardProps> = ({
  steward,
  onDelegate,
  isCurrentDelegate,
  isLoading
}) => {
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const { userBalance } = useDelegation();

  const formatVotingPower = (power: number) => {
    if (power >= 1000000) {
      return `${(power / 1000000).toFixed(2)}M`;
    }
    if (power >= 1000) {
      return `${(power / 1000).toFixed(1)}K`;
    }
    return power.toString();
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(4);
  };

  const validateAmount = (amt: string) => {
    const numAmount = parseFloat(amt);
    const balance = parseFloat(userBalance);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Please enter a valid amount';
    }
    
    if (numAmount > balance) {
      return 'Amount exceeds your UP token balance';
    }
    
    return null;
  };

  const handleDelegate = () => {
    if (showAmountInput && amount.trim()) {
      const amountError = validateAmount(amount);
      if (amountError) {
        setError(amountError);
        return;
      }
    }
    
    setError('');
    onDelegate(steward.address, steward.name, amount.trim() || undefined);
    setAmount('');
    setShowAmountInput(false);
  };

  const handleMaxClick = () => {
    setAmount(userBalance);
  };

  return (
    <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all duration-200 hover:shadow-lg ${
      isCurrentDelegate 
        ? 'border-green-200 bg-green-50/50' 
        : 'border-white/20 hover:border-blue-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={steward.avatar}
            alt={steward.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-bold text-gray-900">{steward.name}</h3>
            <p className="text-sm text-gray-500 font-mono">
              {steward.address.slice(0, 6)}...{steward.address.slice(-4)}
            </p>
          </div>
        </div>
        {isCurrentDelegate && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>Active</span>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{steward.bio}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">{formatVotingPower(steward.votingPower)} UP</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Vote className="w-4 h-4" />
            <span>{steward.proposalsVoted} votes</span>
          </div>
        </div>
      </div>

      {showAmountInput && !isCurrentDelegate && (
        <div className="mb-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount to Delegate
              </label>
              <div className="text-xs text-gray-500">
                Balance: {formatBalance(userBalance)} UP
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount or leave empty for full delegation"
                step="0.000001"
                min="0"
                max={userBalance}
                className={`w-full px-3 py-2 pr-14 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
              >
                MAX
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </div>
          <div className="flex items-start space-x-2">
            <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-600">
              Leave empty to delegate all voting power
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {!isCurrentDelegate && !showAmountInput && (
          <button
            onClick={() => setShowAmountInput(true)}
            disabled={isLoading}
            className="w-full py-2 px-4 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Specify Amount
          </button>
        )}
        
        <button
          onClick={handleDelegate}
          disabled={isCurrentDelegate || isLoading}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            isCurrentDelegate
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
          }`}
        >
          {isCurrentDelegate ? 'Currently Delegated' : isLoading ? 'Delegating...' : 
           showAmountInput ? 'Delegate Amount' : 'Delegate All'}
        </button>

        {showAmountInput && !isCurrentDelegate && (
          <button
            onClick={() => {
              setShowAmountInput(false);
              setAmount('');
              setError('');
            }}
            className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};