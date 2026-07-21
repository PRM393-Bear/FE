import React, { useState, useEffect } from 'react';

/**
 * Reusable Confirm/Prompt Modal component
 * @param {boolean} isOpen - Whether modal is open
 * @param {string} title - Title of the modal
 * @param {string} message - Message/Description
 * @param {string} type - 'confirm' | 'prompt' | 'danger'
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 * @param {string} promptPlaceholder - Placeholder for prompt input
 * @param {string} defaultValue - Default value for prompt
 * @param {Function} onConfirm - Callback when confirmed (receives value if prompt)
 * @param {Function} onClose - Callback when cancelled
 */
export default function ConfirmModal({
  isOpen,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  type = "confirm", // 'confirm' | 'prompt' | 'danger'
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  promptPlaceholder = "Nhập nội dung...",
  defaultValue = "",
  onConfirm,
  onClose
}) {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const isPrompt = type === 'prompt';

  const handleConfirm = () => {
    if (onConfirm) {
      if (isPrompt) {
        onConfirm(inputValue);
      } else {
        onConfirm(true);
      }
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={handleCancel}>
      <div className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isDanger ? 'text-error' : 'text-primary'}`}>
            <span className="material-symbols-outlined">
              {isDanger ? 'warning' : (isPrompt ? 'edit_square' : 'help')}
            </span> 
            {title}
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm font-semibold text-on-surface mb-4 leading-relaxed whitespace-pre-wrap">{message}</p>
          {isPrompt && (
            <textarea 
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y min-h-[100px]"
              placeholder={promptPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          )}
        </div>
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest flex justify-end gap-3">
          <button 
            onClick={handleCancel} 
            className="px-4 py-2 font-semibold text-sm text-on-surface-variant hover:bg-surface-variant/50 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={handleConfirm} 
            className={`px-4 py-2 font-semibold text-sm rounded-xl transition-colors shadow-sm ${
              isDanger 
                ? 'bg-error text-white hover:bg-error/90' 
                : 'bg-primary text-on-primary hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
