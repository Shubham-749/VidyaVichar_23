import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi'

export default function QuestionForm({ onSubmit, className = '', isLoading = false }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!text.trim()) {
      setError('Please enter a question');
      return;
    }
    
    if (text.length > 500) {
      setError('Question must be less than 500 characters');
      return;
    }
    
    onSubmit(text);
    setText('');
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask your question here..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            maxLength={500}
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {text.length}/500
            </span>
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className={`inline-flex items-center justify-center p-2 rounded-full ${
                text.trim() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              } transition-colors`}
              aria-label="Post question"
            >
              <FiSend className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        <div className="text-xs text-gray-500">
          <p>Tip: Be specific and concise. Check for duplicates before posting.</p>
        </div>
      </form>
    </div>
  );
}
