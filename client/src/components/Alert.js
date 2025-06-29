import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function Alert({ type = 'info', message, onClose }) {
  const types = {
    success: 'bg-green-50 text-green-800 border-green-400',
    error: 'bg-red-50 text-red-800 border-red-400',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-400',
    info: 'bg-blue-50 text-blue-800 border-blue-400'
  };

  return (
    <div className={`rounded-md border px-4 py-3 relative ${types[type]}`}>
      <div className="flex">
        <div className="flex-1">{message}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Alert; 