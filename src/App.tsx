import React, { useState } from 'react';
import { Header } from './components/Header';
import { DelegationStatus } from './components/DelegationStatus';
import { StewardCard } from './components/StewardCard';
import { CustomDelegation } from './components/CustomDelegation';
import { DelegationHistory } from './components/DelegationHistory';
import { useWallet } from './hooks/useWallet';
import { useDelegation } from './hooks/useDelegation';
import { stewards } from './data/stewards';
import { Vote, Users, History, AlertTriangle } from 'lucide-react';

function App() {
  const { wallet } = useWallet();
  const { currentDelegate, delegate, isLoading } = useDelegation();
  const [activeTab, setActiveTab] = useState<'delegate' | 'history'>('delegate');

  const handleDelegate = async (address: string, stewardName?: string, amount?: string) => {
    if (!wallet.isConnected) return;
    
    try {
      const delegationType = stewardName ? 'steward' : 'custom';
      await delegate(address, delegationType, stewardName, amount);
    } catch (error) {
      console.error('Delegation failed:', error);
      alert('Delegation failed. Please try again.');
    }
  };

  const handleSelfDelegate = async (amount?: string) => {
    if (!wallet.address) return;
    
    try {
      await delegate(wallet.address, 'self', undefined, amount);
    } catch (error) {
      console.error('Self delegation failed:', error);
      alert('Self delegation failed. Please try again.');
    }
  };

  // if (!wallet.isConnected) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  //       <Header />
  //       <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
  //         <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl max-w-md mx-4">
  //           <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
  //             <Vote className="w-10 h-10 text-white" />
  //           </div>
  //           <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
  //           <p className="text-gray-600 mb-6">
  //             Connect your wallet to delegate your Unlock Protocol voting rights on Base network.
  //           </p>
  //           <div className="text-sm text-gray-500">
  //             Make sure you're on the Base network to participate in governance.
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Show network warning if not on Base
  if (wallet.chainId && wallet.chainId !== 8453) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl max-w-md mx-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Wrong Network</h2>
            <p className="text-gray-600 mb-6">
              Please switch to the Base network to use the Unlock Protocol delegation interface.
            </p>
            <div className="text-sm text-gray-500">
              The UP token is deployed on Base mainnet (Chain ID: 8453).
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <Vote className="w-4 h-4" />
            <span>Base Network • Unlock Protocol</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Delegate Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Voting Rights</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Participate in Unlock Protocol governance by delegating your UP tokens to yourself, 
            trusted stewards, or any address you choose.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-1 border border-white/20">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('delegate')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'delegate'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Delegate</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'delegate' ? (
          <>
            {/* Status Section */}
            <div className="mb-8">
              <DelegationStatus />
            </div>

            {/* Delegation Options */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Self Delegation */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <SelfDelegationCard 
                    onDelegate={handleSelfDelegate}
                    isLoading={isLoading}
                    currentDelegate={currentDelegate}
                    walletAddress={wallet.address}
                  />

                  <CustomDelegation onDelegate={handleDelegate} isLoading={isLoading} />
                </div>
              </div>

              {/* Right Column - Stewards */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Protocol Stewards</h2>
                  <p className="text-gray-600">
                    Delegate to experienced community members who actively participate in governance.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {stewards.map((steward) => (
                    <StewardCard
                      key={steward.id}
                      steward={steward}
                      onDelegate={handleDelegate}
                      isCurrentDelegate={currentDelegate?.toLowerCase() === steward.address.toLowerCase()}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <DelegationHistory />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Built for the Unlock Protocol community</p>
            <p className="text-sm">
              Delegate responsibly • Always verify addresses • Participate in governance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Self Delegation Component
const SelfDelegationCard: React.FC<{
  onDelegate: (amount?: string) => void;
  isLoading: boolean;
  currentDelegate: string | null;
  walletAddress: string | null;
}> = ({ onDelegate, isLoading, currentDelegate, walletAddress }) => {
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const { userBalance } = useDelegation();

  const isCurrentlySelfDelegated = currentDelegate?.toLowerCase() === walletAddress?.toLowerCase();

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
    onDelegate(amount.trim() || undefined);
    setAmount('');
    setShowAmountInput(false);
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
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
          <Vote className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Self Delegation</h3>
          <p className="text-sm text-gray-600">Keep your voting power</p>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        Delegate to yourself to maintain direct control over your voting rights.
      </p>

      {showAmountInput && !isCurrentlySelfDelegated && (
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
                className={`w-full px-3 py-2 pr-14 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
              >
                MAX
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {!isCurrentlySelfDelegated && !showAmountInput && (
          <button
            onClick={() => setShowAmountInput(true)}
            disabled={isLoading}
            className="w-full py-2 px-4 border border-green-300 text-green-600 hover:bg-green-50 rounded-xl font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Specify Amount
          </button>
        )}
        
        <button
          onClick={handleDelegate}
          disabled={isLoading || isCurrentlySelfDelegated}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            isCurrentlySelfDelegated
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-md'
          }`}
        >
          {isCurrentlySelfDelegated ? 'Currently Self-Delegated' : isLoading ? 'Delegating...' : 
           showAmountInput ? 'Delegate Amount' : 'Delegate All to Self'}
        </button>

        {showAmountInput && !isCurrentlySelfDelegated && (
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

export default App;