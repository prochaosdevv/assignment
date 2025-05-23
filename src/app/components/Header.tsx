
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Connect } from './Connect';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { useAccount, useBalance } from 'wagmi';
import { ethers } from 'ethers';

export function Header() {
  const {
    walletAddress,
    setWalletAddress,
    tokenBalance,
    setTokenBalance,
    usdBalance,
    setUsdBalance,
  } = useWallet();

  const tokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  const { isConnected, address } = useAccount();

  const { data: balanceData } = useBalance({
    address,
    token: tokenAddress,
    query: {
      enabled: Boolean(address),
      refetchInterval: 10_000, // refetch every 10s
    },
  });

  const router = useRouter();
  const prevConnected = useRef(isConnected);

  const getConnectedWalletAddress = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Type assertion to Eip1193Provider
      const provider = new ethers.BrowserProvider(
        window.ethereum as unknown as ethers.Eip1193Provider
      );

      // Fetch connected accounts
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const address = accounts[0].address;
        setWalletAddress(accounts[0].address);
        return address;
      } else {
        console.log('No wallet connected');
        return null;
      }
    } else {
      console.log('Ethereum provider not found');
      return null;
    }
  };

  // Update the function to accept an address parameter
async function getPageData(walletAddress: string) {
  try {
    const response = await fetch(`../api/useraccount?walletAddress=${walletAddress}`);
    if (!response.ok) {
      console.error("API request failed with status:", response.status);
      setUsdBalance(0);
      return;
    }
    
    const res = await response.json();
    if (res.useraccounts && res.useraccounts.length > 0) {
      setUsdBalance(res.useraccounts[0].balance);
    } else {
      setUsdBalance(0);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    setUsdBalance(0);
  }
}

useEffect(() => {
  if (isConnected) {
    if (address) {
      setWalletAddress(address);
      getPageData(address);
      if (balanceData?.value) {
        setTokenBalance(Number(balanceData.formatted));
      }
    }
  } else if (prevConnected.current) {
    // Only redirect if the user was previously connected and now is disconnected
    setWalletAddress(null);
    setTokenBalance(0);
    setUsdBalance(0);
    router.push('/');
  }
  prevConnected.current = isConnected;
  // eslint-disable-next-line
}, [isConnected, address, balanceData]);

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white w-full">
      <Link href="/">
        <Image src="/logo.png" alt="RMT Logo" width={40} height={35} />
      </Link>

      <div className="flex space-x-6 ml-7 font-bold">
        <Link href="/">Home</Link>
        <Link href="/deposit">Deposit</Link>
        <Link href="/convert">Convert</Link>
        <Link href="/sendtoken">Send Token</Link>
        <Link href="/withdraw">Withdraw</Link>
        <Link href="/transaction">Transaction</Link>
      </div>

      <div className="flex items-center space-x-3 ml-auto">
        {isConnected && (
          <div className="bg-gray-800 px-4 py-2 rounded-full shadow-md border border-gray-600 flex space-x-3 items-center">
            <span className="text-yellow-300 font-bold">USD {usdBalance}</span>
            <span className="text-purple-400 font-bold">
              RMT {tokenBalance?.toFixed(2)}
            </span>
          </div>
        )}
        <Connect />
      </div>
    </nav>
  );
}
