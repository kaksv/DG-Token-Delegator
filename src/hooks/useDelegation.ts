import { useState, useEffect } from 'react';
import { parseUnits, formatUnits, getAddress } from 'viem';
import { DelegationRecord } from '../types';
import { useWallet } from './useWallet';

const UP_TOKEN_ADDRESS = '0xac27fa800955849d6d17cc8952ba9dd6eaa66187' as const;

// ERC20Votes ABI for delegation
const ERC20_VOTES_ABI = [
  {
    inputs: [{ name: 'delegatee', type: 'address' }],
    name: 'delegate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'delegates',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'getVotes',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const useDelegation = () => {
  const { wallet } = useWallet();
  const [delegationHistory, setDelegationHistory] = useState<DelegationRecord[]>([]);
  const [currentDelegate, setCurrentDelegate] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<string>('0');
  const [votingPower, setVotingPower] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDelegationHistory();
  }, []);

  useEffect(() => {
    if (wallet.isConnected && wallet.client && wallet.address) {
      fetchUserData();
      fetchCurrentDelegate();
    }
  }, [wallet.isConnected, wallet.client, wallet.address]);

  const fetchUserData = async () => {
    if (!wallet.client || !wallet.address) return;

    try {
      const [balance, votes] = await Promise.all([
        wallet.client.readContract({
          address: UP_TOKEN_ADDRESS,
          abi: ERC20_VOTES_ABI,
          functionName: 'balanceOf',
          args: [wallet.address],
        }),
        wallet.client.readContract({
          address: UP_TOKEN_ADDRESS,
          abi: ERC20_VOTES_ABI,
          functionName: 'getVotes',
          args: [wallet.address],
        }),
      ]);

      setUserBalance(formatUnits(balance, 18));
      setVotingPower(formatUnits(votes, 18));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCurrentDelegate = async () => {
    if (!wallet.client || !wallet.address) return;

    try {
      const delegate = await wallet.client.readContract({
        address: UP_TOKEN_ADDRESS,
        abi: ERC20_VOTES_ABI,
        functionName: 'delegates',
        args: [wallet.address],
      });

      setCurrentDelegate(delegate === '0x0000000000000000000000000000000000000000' ? null : delegate);
    } catch (error) {
      console.error('Error fetching current delegate:', error);
    }
  };

  const loadDelegationHistory = () => {
    const stored = localStorage.getItem('unlock-delegation-history');
    if (stored) {
      try {
        const history = JSON.parse(stored);
        setDelegationHistory(history);
      } catch (error) {
        console.error('Error loading delegation history:', error);
      }
    }
  };

  const addDelegationRecord = (record: Omit<DelegationRecord, 'id' | 'timestamp'>) => {
    const newRecord: DelegationRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    const updatedHistory = [newRecord, ...delegationHistory];
    setDelegationHistory(updatedHistory);
    localStorage.setItem('unlock-delegation-history', JSON.stringify(updatedHistory));

    return newRecord.id;
  };

  const updateDelegationStatus = (id: string, status: DelegationRecord['status'], transactionHash?: string) => {
    const updatedHistory = delegationHistory.map(record => 
      record.id === id 
        ? { ...record, status, ...(transactionHash && { transactionHash }) }
        : record
    );
    
    setDelegationHistory(updatedHistory);
    localStorage.setItem('unlock-delegation-history', JSON.stringify(updatedHistory));

    if (status === 'completed') {
      const updatedRecord = updatedHistory.find(r => r.id === id);
      if (updatedRecord) {
        setCurrentDelegate(updatedRecord.toAddress);
        fetchUserData(); // Refresh voting power after successful delegation
      }
    }
  };

  const delegate = async (
    toAddress: string, 
    delegationType: DelegationRecord['delegationType'], 
    stewardName?: string,
    amount?: string
  ) => {
    if (!wallet.client || !wallet.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);

    const record = {
      fromAddress: wallet.address,
      toAddress: getAddress(toAddress),
      delegationType,
      stewardName,
      amount,
      status: 'pending' as const
    };

    const recordId = addDelegationRecord(record);

    try {
      // Note: The current ERC20Votes standard doesn't support partial delegation
      // This is a limitation of the standard - delegation is always for the full balance
      // The amount parameter is stored for record keeping but the actual delegation
      // will delegate all voting power to the specified address
      
      const hash = await wallet.client.writeContract({
        address: UP_TOKEN_ADDRESS,
        abi: ERC20_VOTES_ABI,
        functionName: 'delegate',
        args: [getAddress(toAddress)],
        account: wallet.address,
      });

      // Wait for transaction confirmation
      const receipt = await wallet.client.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        updateDelegationStatus(recordId, 'completed', hash);
        await fetchCurrentDelegate();
        await fetchUserData();
      } else {
        updateDelegationStatus(recordId, 'failed', hash);
        throw new Error('Transaction failed');
      }

      return hash;
    } catch (error) {
      console.error('Delegation failed:', error);
      updateDelegationStatus(recordId, 'failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const undelegate = async () => {
    if (!wallet.client || !wallet.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);

    const record = {
      fromAddress: wallet.address,
      toAddress: '0x0000000000000000000000000000000000000000',
      delegationType: 'custom' as const,
      stewardName: undefined,
      amount: undefined,
      status: 'pending' as const
    };

    const recordId = addDelegationRecord(record);

    try {
      // Delegate to zero address to remove delegation
      const hash = await wallet.client.writeContract({
        address: UP_TOKEN_ADDRESS,
        abi: ERC20_VOTES_ABI,
        functionName: 'delegate',
        args: ['0x0000000000000000000000000000000000000000'],
        account: wallet.address,
      });

      // Wait for transaction confirmation
      const receipt = await wallet.client.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        updateDelegationStatus(recordId, 'completed', hash);
        await fetchCurrentDelegate();
        await fetchUserData();
      } else {
        updateDelegationStatus(recordId, 'failed', hash);
        throw new Error('Transaction failed');
      }

      return hash;
    } catch (error) {
      console.error('Undelegation failed:', error);
      updateDelegationStatus(recordId, 'failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    delegationHistory,
    currentDelegate,
    userBalance,
    votingPower,
    isLoading,
    delegate,
    undelegate,
    fetchUserData,
    fetchCurrentDelegate
  };
};