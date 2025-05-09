"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMetaMask } from "../hooks/useMetaMask";
import { QuestType, useQuestType } from "../context/QuestTypeContext";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { address, isConnected, connectMetaMask, disconnect } = useMetaMask();
  const { questType, setQuestType } = useQuestType();

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: "/",
      redirect: true 
    });
    router.refresh();
  };

  const handleQuestTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuestType(Number.parseInt(e.target.value, 10));
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-gray-800">
              On chain Quests
            </Link>
            
            {/* Quest Type Selector */}
            <div className="ml-4">
              <select
                value={questType}
                onChange={handleQuestTypeChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value={QuestType.VOTING}>JWT Voting</option>
                <option value={QuestType.RIDDLE}>Riddle Solving</option>
              </select>
            </div>
          </div>
          
          {/* Wallet Connect/Disconnect - Center */}
          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={connectMetaMask}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Connect MetaMask
              </button>
            )}
          </div>
          
          {/* Google Auth - Right */}
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {session.user?.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {session.user?.email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 