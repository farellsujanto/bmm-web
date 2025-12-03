'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertDialog } from '@/src/components/ui/AlertDialog';

interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
}

interface ConfirmOptions extends AlertOptions {
  cancelText?: string;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title?: string;
    message: string;
    type: 'alert' | 'confirm';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    message: '',
    type: 'alert',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertConfig({
      title: options.title,
      message: options.message,
      type: 'alert',
      confirmText: options.confirmText || 'OK',
      onConfirm: () => setIsOpen(false),
      onCancel: () => setIsOpen(false)
    });
    setIsOpen(true);
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlertConfig({
        title: options.title,
        message: options.message,
        type: 'confirm',
        confirmText: options.confirmText || 'OK',
        cancelText: options.cancelText || 'Cancel',
        onConfirm: () => {
          setIsOpen(false);
          resolve(true);
        },
        onCancel: () => {
          setIsOpen(false);
          resolve(false);
        }
      });
      setIsOpen(true);
    });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertDialog
        isOpen={isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
