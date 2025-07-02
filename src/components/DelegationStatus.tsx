import React from 'react';
import { CheckCircle, Clock, User, Coins, Vote } from 'lucide-react';
import { useDelegation } from '../hooks/useDelegation';
import { useWallet } from '../hooks/useWallet';
import { stewards } from '../data/stewards';

export const DelegationStatus: React.FC = () => {
  const { currentDelegate, delegationHistory, userBalance, votingPower } = useDelegation();
  const { wallet } = useWallet();

  const getCurrentDelegateName = () => {
    if (!currentDelegate) return null;
    
    if (currentDelegate.toLowerCase() === wallet.address?.toLowerCase()) {
      return 'Self';
    }
    
    const steward = stewards.find(s => s.address.toLowerCase() === currentDelegate.toLowerCase());
    if (steward) return steward.name;
    
    return currentDelegate;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  const pendingDelegations = delegationHistory.filter(d => d.status === 'pending').length;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Account Overview</h2>
        {pendingDelegations > 0 && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            <span>{pendingDelegations} pending</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <Coins className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">UP Balance</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatBalance(userBalance)}
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <Vote className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Voting Power</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatBalance(votingPower)}
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Delegated To</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {currentDelegate ? (
              getCurrentDelegateName() === 'Self' ? 'Self' : 
              getCurrentDelegateName()?.length > 15 ? 
              formatAddress(getCurrentDelegateName()!) : 
              getCurrentDelegateName()
            ) : 'None'}
          </p>
        </div>
      </div>

      {currentDelegate ? (
        <div className="flex items-center space-x-4 bg-green-50 rounded-xl p-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-green-700 font-medium">Active Delegation</p>
            <p className="text-green-800">
              Your voting rights are delegated to{' '}
              <span className="font-semibold">
                {getCurrentDelegateName() === 'Self' ? 'yourself' : getCurrentDelegateName()}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">No Active Delegation</p>
            <p className="text-gray-700">Delegate your voting power to participate in governance</p>
          </div>
        </div>
      )}
    </div>
  );
};