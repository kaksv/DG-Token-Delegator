import { useState, useEffect } from 'react';
import { createWalletClient, custom, publicActions, getAddress } from 'viem';
import { base } from 'viem/chains';
import { WalletState } from '../types';

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    client: null
  });

  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setWallet(prev => ({ ...prev, address: getAddress(accounts[0]) }));
    }
  };

  const handleChainChanged = (chainId: string) => {
    setWallet(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
  };

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts.length > 0) {
          const client = createWalletClient({
            chain: base,
            transport: custom(window.ethereum)
          }).extend(publicActions);

          setWallet({
            address: getAddress(accounts[0]),
            isConnected: true,
            isConnecting: false,
            chainId: parseInt(chainId, 16),
            client
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this application');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      // Switch to Base if not already connected
      if (parseInt(chainId, 16) !== base.id) {
        await switchToBase();
      }

      const client = createWalletClient({
        chain: base,
        transport: custom(window.ethereum)
      }).extend(publicActions);

      setWallet({
        address: getAddress(accounts[0]),
        isConnected: true,
        isConnecting: false,
        chainId: parseInt(chainId, 16),
        client
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const switchToBase = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${base.id.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${base.id.toString(16)}`,
            chainName: base.name,
            nativeCurrency: base.nativeCurrency,
            rpcUrls: base.rpcUrls.default.http,
            blockExplorerUrls: [base.blockExplorers.default.url]
          }]
        });
      }
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
      client: null
    });
  };

  return {
    wallet,
    connectWallet,
    disconnectWallet
  };
};