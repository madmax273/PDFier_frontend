import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type ToastProps = {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
  duration?: number;
};

export function Toast({ message, type, onDismiss, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const icon = type === 'success' ? (
    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
  ) : (
    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
  );

  return (
    <div 
      className={`fixed top-14 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`flex items-center px-6 py-3 rounded-md shadow-lg ${bgColor} border ${borderColor} min-w-[300px]`}
      >
        {icon}
        <span className={`text-sm font-medium ${textColor}`}>
          {message}
        </span>
        <button 
          onClick={() => {
            setIsVisible(false);
            onDismiss();
          }}
          className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}