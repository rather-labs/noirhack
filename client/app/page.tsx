"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import { useJWTInfo, getOpenIDClaims } from "./utils/auth";
import { useSession } from "next-auth/react";
import { generateInputs } from "noir-jwt";


// Define proper types for inputs and session
type NoirInputs = Record<string, unknown>; // Replace with proper type if available
interface ExtendedSession {
  idToken?: string;
  [key: string]: unknown;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [inputs, setInputs] = useState<NoirInputs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jwtInfo = useJWTInfo();

  async function getInputs() {
    if (status === "authenticated" && session) {
      try {
        setIsLoading(true);
        setError(null);

        // Cast session to unknown first for safe type conversion
        const extendedSession = session as unknown as ExtendedSession;
        if (!extendedSession.idToken) {
          throw new Error("ID token not available");
        }

        // get public key from google
        const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
        const keys = await response.json();
        
        const [headerEncoded] = extendedSession.idToken.split('.');
        if (!headerEncoded) {
          throw new Error("Invalid JWT format");
        }
        
        const header = JSON.parse(atob(headerEncoded.replace(/-/g, '+').replace(/_/g, '/')));
        const kid = header.kid;
        const pubkey = keys.keys.find((key: { kid: string }) => key.kid === kid);
        console.log("pubkey", pubkey);

        const generatedInputs = await generateInputs({
          jwt: extendedSession.idToken,
          pubkey,
          maxSignedDataLength: 1024,
        });
        console.log("inputs", generatedInputs);
        setInputs(generatedInputs);
        setShowInputs(true);
        return generatedInputs;
      } catch (err: unknown) {
        console.error("Error getting inputs:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to get inputs";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    }
    return null;
  }

  const handleShowToken = () => {
    setShowTokenInfo(!showTokenInfo);
  };

  const handleToggleInputs = async () => {
    if (showInputs) {
      // If inputs are currently shown, just hide them
      setShowInputs(false);
    } else {
      // If inputs are not shown, get them first (if needed)
      if (!inputs) {
        await getInputs();
      } else {
        setShowInputs(true);
      }
    }
  };

  const openIdClaims = jwtInfo?.idToken ? getOpenIDClaims(jwtInfo.idToken) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to JWT Voting
              </h1>
              <p className="text-gray-600 mb-6">
                {session ? "You are signed in" : "Sign in to start voting or create new polls"}
              </p>
              
              {session && (
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={handleShowToken}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {showTokenInfo ? "Hide Token Info" : "Show Token Info"}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleInputs}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isLoading ? "Loading..." : showInputs ? "Hide Noir Inputs" : "Get Noir Inputs"}
                  </button>
                </div>
              )}
            </div>

            {showTokenInfo && jwtInfo && (
              <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">JWT Token Information</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">OpenID Connect details and claims.</p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">User ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {openIdClaims?.sub || "Not available"}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Full name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {openIdClaims?.name || "Not available"}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email address</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {openIdClaims?.email || "Not available"}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email verified</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {openIdClaims?.email_verified ? "Yes" : "No"}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Issuer</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {openIdClaims?.iss || "Not available"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
            
            {showInputs && inputs && (
              <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Noir JWT Inputs</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Generated inputs for Noir JWT verification.</p>
                </div>
                <div className="border-t border-gray-200 p-4">
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs text-gray-800 h-64">
                    {JSON.stringify(inputs, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error getting Noir inputs</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
