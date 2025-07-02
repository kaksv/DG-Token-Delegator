import { WalletClient, PublicClient } from 'viem';

export interface Steward {
  id: string;
  name: string;
  address: string;
  bio: string;
  avatar: string;
  votingPower: number;
  proposalsVoted: number;
}

export interface DelegationRecord {
  id: string;
  timestamp: number;
  fromAddress: string;
  toAddress: string;
  delegationType: 'self' | 'steward' | 'custom';
  stewardName?: string;
  amount?: string;
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  client: (WalletClient & PublicClient) | null;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}