/**
 * 🍍 JOLANANAS - Notification Context Provider
 * ============================================
 * Provider pour les notifications toast
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface NotificationContextType {
  // Notification context peut être étendu selon les besoins
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const value: NotificationContextType = {
    // Valeurs par défaut
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
