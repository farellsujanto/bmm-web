'use client';

import React from 'react';
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
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={type === 'alert' ? handleConfirm : handleCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-in">
        {title && (
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {title}
          </h3>
        )}
        
        <p className="text-gray-700 mb-6 whitespace-pre-line">
          {message}
        </p>
        
        <div className="flex gap-3 justify-end">
          {type === 'confirm' && (
            <SecondaryButton
              onClick={handleCancel}
              size="sm"
            >
              {cancelText}
            </SecondaryButton>
          )}
          <PrimaryButton
            onClick={handleConfirm}
            size="sm"
          >
            {confirmText}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
