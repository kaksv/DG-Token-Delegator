import React, { useState } from 'react';
import { Send, AlertCircle, Info } from 'lucide-react';
import { useDelegation } from '../hooks/useDelegation';

interface CustomDelegationProps {
  onDelegate: (address: string, amount?: string) => void;
  isLoading: boolean;
}

export const CustomDelegation: React.FC<CustomDelegationProps> = ({
  onDelegate,
  isLoading
}) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const { userBalance } = useDelegation();

  const validateAddress = (addr: string) => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(addr);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    if (!validateAddress(address)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    if (amount.trim()) {
      const amountError = validateAmount(amount);
      if (amountError) {
        setError(amountError);
        return;
      }
    }

    onDelegate(address, amount.trim() || undefined);
    setAddress('');
    setAmount('');
  };

  const handleMaxClick = () => {
    setAmount(userBalance);
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

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Send className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Custom Delegation</h3>
          <p className="text-sm text-gray-600">Delegate to any address</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="delegate-address" className="block text-sm font-medium text-gray-700 mb-2">
            Delegate Address
          </label>
          <input
            type="text"
            id="delegate-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
              error && !amount ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="delegate-amount" className="block text-sm font-medium text-gray-700">
              Amount to Delegate (Optional)
            </label>
            <div className="text-xs text-gray-500">
              Balance: {formatBalance(userBalance)} UP
            </div>
          </div>
          <div className="relative">
            <input
              type="number"
              id="delegate-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount or leave empty for full delegation"
              step="0.000001"
              min="0"
              max={userBalance}
              className={`w-full px-4 py-3 pr-16 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                error && amount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={handleMaxClick}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
            >
              MAX
            </button>
          </div>
          <div className="flex items-start space-x-2 mt-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-600">
              Leave amount empty to delegate all your voting power. You can change your delegation at any time.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !address.trim()}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Delegating...' : 'Delegate Voting Rights'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <p className="text-xs text-purple-700">
          <strong>Note:</strong> Delegation transfers your voting power but not your tokens. 
          Your UP tokens remain in your wallet and you can undelegate at any time.
        </p>
      </div>
    </div>
  );
};