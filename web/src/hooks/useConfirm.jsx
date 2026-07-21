import React, { useState, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal.jsx';

export function useConfirm() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "confirm",
    confirmText: "Xác nhận",
    cancelText: "Hủy bỏ",
    promptPlaceholder: "",
    defaultValue: "",
    resolve: null
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || "Xác nhận",
        message: options.message || "",
        type: options.type || "confirm",
        confirmText: options.confirmText || "Xác nhận",
        cancelText: options.cancelText || "Hủy bỏ",
        promptPlaceholder: options.promptPlaceholder || "Nhập nội dung...",
        defaultValue: options.defaultValue || "",
        resolve
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setModalState(prev => {
      if (prev.resolve) prev.resolve(prev.type === 'prompt' ? null : false);
      return { ...prev, isOpen: false };
    });
  }, []);

  const handleConfirm = useCallback((value) => {
    setModalState(prev => {
      if (prev.resolve) prev.resolve(prev.type === 'prompt' ? value : true);
      return { ...prev, isOpen: false };
    });
  }, []);

  const ConfirmComponent = (
    <ConfirmModal 
      {...modalState}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );

  return { confirm, ConfirmComponent };
}
