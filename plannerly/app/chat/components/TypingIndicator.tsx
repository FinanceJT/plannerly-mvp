import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 my-2">
      <span
        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: '0s' }}
      />
      <span
        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: '0.1s' }}
      />
      <span
        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: '0.2s' }}
      />
    </div>
  );
};

export default TypingIndicator;
