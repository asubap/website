import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const Toast = ({ message, duration = 3000, onClose, type = 'success' }: ToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation before removing from DOM
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Get background color based on type
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-green-600';
    }
  };

  // Create a portal to render at the body level
  return createPortal(
    <div 
      className={`fixed bottom-24 right-4 z-[9999] transform transition-opacity duration-300 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className={`${getBgColor()} text-white rounded-lg shadow-lg p-4 max-w-md flex items-center justify-between`}>
        <div className="flex items-center">
          {type === 'success' && (
            <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
            </svg>
          )}
          {type === 'error' && (
            <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          )}
          {type === 'info' && (
            <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          )}
          <p>{message}</p>
        </div>
        <div className="flex items-center ml-4">
          <button 
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Toast; 