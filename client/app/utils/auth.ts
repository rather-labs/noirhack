import { getSession, useSession } from "next-auth/react";

export interface CustomSessionData {
  accessToken?: string;
  customData?: {
    userId?: string;
    email?: string;
  };
}

export async function getSignedData() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const customSession = session as CustomSessionData;
  return {
    accessToken: customSession.accessToken,
    customData: customSession.customData,
  };
}

export function useSignedData() {
  const { data: session } = useSession();
  if (!session) {
    return null;
  }

  const customSession = session as CustomSessionData;
  return {
    accessToken: customSession.accessToken,
    customData: customSession.customData,
  };
} 