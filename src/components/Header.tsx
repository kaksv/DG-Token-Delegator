import React from 'react';
import { Vote, Wallet, LogOut } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const Header: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Unlock Protocol</h1>
              <p className="text-sm text-gray-600">Voting Delegation</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {wallet.chainId && wallet.chainId !== 8453 && (
              <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                Switch to Base Network
              </div>
            )}
            
            {wallet.isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
                  {formatAddress(wallet.address!)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={wallet.isConnecting}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Wallet className="w-5 h-5" />
                <span>{wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};