import React, { useEffect, useRef } from 'react';
import ModalPortal from './ModalPortal';

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose?: () => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  showCloseButton?: boolean;
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

/**
 * A reusable modal wrapper component that handles common modal behaviors
 * like closing on escape key, outside click, and proper positioning.
 * Enhanced with accessibility features for keyboard navigation and screen readers.
 */
const ModalWrapper: React.FC<ModalWrapperProps> = ({
  children,
  onClose,
  maxWidth = '4xl',
  showCloseButton = false,
  closeOnEsc = true,
  closeOnOutsideClick = true,
  initialFocusRef,
  ariaLabel,
  ariaDescribedBy,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management for modal
  useEffect(() => {
    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;
    
    // Set initial focus
    setTimeout(() => {
      if (initialFocusRef && initialFocusRef.current) {
        initialFocusRef.current.focus();
      } else if (closeButtonRef.current && showCloseButton) {
        closeButtonRef.current.focus();
      } else if (modalRef.current) {
        // Find the first focusable element
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);
    
    // Trap focus within modal
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    // Handle focus restoration when elements are dynamically added/removed
    const observer = new MutationObserver(() => {
      // If focus is lost (not within modal), reset it to a safe element
      if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        } else {
          modalRef.current.focus();
        }
      }
    });
    
    if (modalRef.current) {
      observer.observe(modalRef.current, { 
        childList: true, 
        subtree: true 
      });
    }
    
    document.addEventListener('keydown', handleTabKey);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      observer.disconnect();
      
      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [initialFocusRef, showCloseButton]);

  // Handle escape key press
  useEffect(() => {
    if (!closeOnEsc || !onClose) return;
    
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [closeOnEsc, onClose]);
  
  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && onClose && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Map maxWidth to Tailwind classes
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    'full': 'max-w-full'
  };
  
  return (
    <ModalPortal>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || "Modal dialog"}
        aria-describedby={ariaDescribedBy}
      >
        <div 
          ref={modalRef}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-[95%] max-h-[90vh] overflow-hidden mx-auto my-4`}
          tabIndex={-1}
          role="document"
        >
        {showCloseButton && onClose && (
          <div className="absolute top-4 right-4 z-10">
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Close modal"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
      </div>
    </ModalPortal>
  );
};

export default ModalWrapper;