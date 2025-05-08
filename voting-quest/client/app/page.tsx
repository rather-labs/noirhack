"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import { useJWTInfo, getOpenIDClaims } from "./utils/auth";
import { useSession } from "next-auth/react";
import { generateInputs } from "noir-jwt";
import { generateProof, verifyProof, castVoteOnChain, getDescription, type ProofDataForRecursion } from "./utils/noir";
import type { InputMap } from "@noir-lang/types";
import { Toaster } from 'react-hot-toast';
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
  const [proof, setProof] = useState<ProofDataForRecursion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [isVerifyingProof, setIsVerifyingProof] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCastingVote, setIsCastingVote] = useState(false);
  const [candidate, setCandidate] = useState<string>("1");
  const [identifier, setIdentifier] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [description, setDescription] = useState<string>("Description not fetched");
  const [isGettingDescription, setIsGettingDescription] = useState(false);
  const jwtInfo = useJWTInfo();
  const openIdClaims = jwtInfo?.idToken ? getOpenIDClaims(jwtInfo.idToken) : null;

  // Function to handle identifier input changes
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input
    if (/^\d*$/.test(value)) {
      setIdentifier(value);
    }
  };

  // Function to copy the hash to clipboard
  const copyToClipboard = () => {
    if (identifier) {
      navigator.clipboard.writeText(identifier).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

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

  async function generateNoirProof() {
    if (!inputs) {
      setError("No inputs available. Please generate inputs first.");
      return;
    }

    try {
      setIsGeneratingProof(true);
      setError(null);
      console.log("inputs", inputs);
      const generatedProof = await generateProof(inputs as InputMap);
      setProof(generatedProof);
    } catch (err: unknown) {
      console.error("Error generating proof:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate proof";
      setError(errorMessage);
    } finally {
      setIsGeneratingProof(false);
    }
  }

  async function verifyNoirProof() {
    if (!proof) {
      setError("No proof available. Please generate proof first.");
      return;
    }

    try {
      setIsVerifyingProof(true);
      setError(null);
      const result = await verifyProof(proof);
      setVerificationResult(result);
    } catch (err: unknown) {
      console.error("Error verifying proof:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to verify proof";
      setError(errorMessage);
    } finally {
      setIsVerifyingProof(false);
    }
  }

  async function castVote() {
    if (!proof) {
      setError("No proof available. Please generate proof first.");
      return;
    }

    if (!identifier) {
      setError("Field identifier not generated. Please try again.");
      return;
    }

    try {
      setIsCastingVote(true);
      setError(null);
      
      // Convert candidate to numeric value if needed
      const candidateValue = candidate.trim() === "" ? "1" : candidate;
      
      // The castVoteOnChain function will handle converting the identifier to the appropriate type
      await castVoteOnChain(proof, Number.parseInt(identifier), Number.parseInt(candidateValue));
      
    } catch (err: unknown) {
      console.error("Error casting vote:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to cast vote";
      setError(errorMessage);
    } finally {
      setIsCastingVote(false);
    }
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

  async function handleGetDescription() {
    try {
      setIsGettingDescription(true);
      setError(null);
      const result = await getDescription();
      if (result) {
        setDescription(result.toString());
      }
    } catch (err: unknown) {
      console.error("Error getting description:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to get description";
      setError(errorMessage);
    } finally {
      setIsGettingDescription(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster />
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
                    onClick={handleGetDescription}
                    disabled={isGettingDescription}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                  >
                    {isGettingDescription ? "Getting Description..." : "Get Description"}
                  </button>
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
                  {inputs && (
                    <button
                      type="button"
                      onClick={generateNoirProof}
                      disabled={isGeneratingProof}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {isGeneratingProof ? "Generating Proof..." : "Generate Proof"}
                    </button>
                  )}
                  {proof && (
                    <>
                      <button
                        type="button"
                        onClick={verifyNoirProof}
                        disabled={isVerifyingProof}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isVerifyingProof ? "Verifying Proof..." : "Verify Proof"}
                      </button>
                      
                      <button
                        type="button"
                        onClick={castVote}
                        disabled={isCastingVote}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                      >
                        {isCastingVote ? "Casting Vote..." : "Cast Vote On-Chain"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <p className="text-gray-700">{description}</p>
            </div>

            {proof && (
              <div className="mt-6 w-full max-w-sm mx-auto space-y-4">
                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                    Field Identifier
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="identifier"
                      id="identifier"
                      className="font-mono block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm rounded-r-none"
                      value={identifier}
                      onChange={handleIdentifierChange}
                      placeholder="Enter an unsigned integer"
                    />
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 bg-gray-50 text-gray-500 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      aria-label="Copy to clipboard"
                    >
                      {copied ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <title>Copy to clipboard</title>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter an unsigned integer that will be used to identify your vote on the blockchain.
                    This value must be a positive whole number.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="candidate" className="block text-sm font-medium text-gray-700">
                    Candidate ID
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="candidate"
                      id="candidate"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter candidate ID (e.g. 1)"
                      value={candidate}
                      onChange={(e) => setCandidate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

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

            {proof && (
              <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Generated Proof</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Zero-knowledge proof of JWT verification.</p>
                </div>
                <div className="border-t border-gray-200 p-4">
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs text-gray-800 h-64">
                    {JSON.stringify(proof, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {verificationResult && (
              <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Verification Result</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Result of the proof verification.</p>
                </div>
                <div className="border-t border-gray-200 p-4">
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs text-gray-800 h-64">
                    {verificationResult}
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
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
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
