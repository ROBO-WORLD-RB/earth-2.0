import React, { useState, useEffect } from 'react';

interface FeatureNotificationProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
  autoClose?: number; // milliseconds
}

const FeatureNotification: React.FC<FeatureNotificationProps> = ({
  title,
  message,
  action,
  onClose,
  autoClose = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleAction = () => {
    if (action) {
      action.onClick();
      handleClose();
    }
  };

  return (
    <div className={`fixed top-20 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-sm">{title}</h4>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-sm text-white/90 mb-3">{message}</p>
        
        {action && (
          <button
            onClick={handleAction}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default FeatureNotification;