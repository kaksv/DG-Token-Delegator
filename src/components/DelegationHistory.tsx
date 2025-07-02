import React from 'react';
import { Clock, CheckCircle, XCircle, ExternalLink, ArrowRight, User, Users, Send } from 'lucide-react';
import { useDelegation } from '../hooks/useDelegation';
import { stewards } from '../data/stewards';

export const DelegationHistory: React.FC = () => {
  const { delegationHistory } = useDelegation();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStewardName = (address: string) => {
    const steward = stewards.find(s => s.address.toLowerCase() === address.toLowerCase());
    return steward?.name;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const getDelegationTypeIcon = (type: string) => {
    switch (type) {
      case 'self':
        return <User className="w-4 h-4" />;
      case 'steward':
        return <Users className="w-4 h-4" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  const getDelegationTypeLabel = (type: string) => {
    switch (type) {
      case 'self':
        return 'Self Delegation';
      case 'steward':
        return 'Steward Delegation';
      default:
        return 'Custom Delegation';
    }
  };

  if (delegationHistory.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Delegation History</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Your delegation transactions will appear here once you start delegating your voting rights.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Delegation History</h2>
        <p className="text-gray-600">
          Track all your delegation transactions and their current status.
        </p>
      </div>

      <div className="space-y-4">
        {delegationHistory.map((record) => (
          <div
            key={record.id}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {getDelegationTypeIcon(record.delegationType)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {getDelegationTypeLabel(record.delegationType)}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(record.timestamp)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                {getStatusIcon(record.status)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">From</p>
                  <p className="font-mono text-sm text-gray-900">
                    {formatAddress(record.fromAddress)}
                  </p>
                </div>
                
                <ArrowRight className="w-4 h-4 text-gray-400" />
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">To</p>
                  <div>
                    <p className="font-mono text-sm text-gray-900">
                      {formatAddress(record.toAddress)}
                    </p>
                    {record.stewardName && (
                      <p className="text-xs text-blue-600 font-medium">
                        {record.stewardName}
                      </p>
                    )}
                    {record.delegationType === 'self' && (
                      <p className="text-xs text-green-600 font-medium">
                        Self
                      </p>
                    )}
                    {record.delegationType === 'custom' && !record.stewardName && (
                      <p className="text-xs text-purple-600 font-medium">
                        {getStewardName(record.toAddress) || 'Custom Address'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {record.transactionHash && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Transaction Hash:</span>
                  <span className="font-mono ml-2">
                    {formatAddress(record.transactionHash)}
                  </span>
                </div>
                <a
                  href={`https://basescan.org/tx/${record.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <span>View on BaseScan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {delegationHistory.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Showing {delegationHistory.length} delegation{delegationHistory.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};