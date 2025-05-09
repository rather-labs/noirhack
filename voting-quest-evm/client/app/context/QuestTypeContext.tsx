"use client";

import { createContext, useContext, useState, type ReactNode } from 'react';

export enum QuestType {
  VOTING = 1,
  RIDDLE = 2
}

interface QuestTypeContextType {
  questType: QuestType;
  setQuestType: (type: QuestType) => void;
}

const QuestTypeContext = createContext<QuestTypeContextType | undefined>(undefined);

export function QuestTypeProvider({ children }: { children: ReactNode }) {
  const [questType, setQuestType] = useState<number>(1); // Default to quest type 1

  return (
    <QuestTypeContext.Provider value={{ questType, setQuestType }}>
      {children}
    </QuestTypeContext.Provider>
  );
}

export function useQuestType() {
  const context = useContext(QuestTypeContext);
  if (context === undefined) {
    throw new Error('useQuestType must be used within a QuestTypeProvider');
  }
  return context;
} 