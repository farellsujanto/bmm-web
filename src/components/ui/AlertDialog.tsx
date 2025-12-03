'use client';

import React, { useEffect } from 'react';
import { PrimaryButton, SecondaryButton } from './Button';

interface AlertDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: 'alert' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function AlertDialog({
  isOpen,
  title,
  message,
  type = 'alert',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: AlertDialogProps) {
  // Lock body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={type === 'alert' ? handleConfirm : handleCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md mx-auto p-5 sm:p-6 animate-scale-in overflow-hidden">
        {title && (
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 break-words">
            {title}
          </h3>
        )}
        
        <p className="text-sm sm:text-base text-gray-700 mb-5 sm:mb-6 whitespace-pre-line break-words leading-relaxed">
          {message}
        </p>
        
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          {type === 'confirm' && (
            <SecondaryButton
              onClick={handleCancel}
              size="sm"
              className="w-full sm:w-auto"
            >
              {cancelText}
            </SecondaryButton>
          )}
          <PrimaryButton
            onClick={handleConfirm}
            size="sm"
            className="w-full sm:w-auto"
          >
            {confirmText}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
