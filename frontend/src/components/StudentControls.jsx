import React from 'react';
import { FiFilter, FiMessageSquare, FiStar } from 'react-icons/fi';

export default function StudentControls({ 
  questions = [], 
  activeFilter,
  onFilterChange 
}) {
  const FILTERS = [
    { id: 'all', label: 'All', icon: <FiMessageSquare className="mr-2" /> },
    { id: 'unanswered', label: 'Unanswered', icon: <FiMessageSquare className="mr-2" /> },
    { id: 'important', label: 'Important', icon: <FiStar className="mr-2" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center text-sm font-medium text-gray-500">
          <FiFilter className="mr-2" />
          <span className="mr-4">Filter:</span>
          <nav className="flex space-x-2" aria-label="Tabs">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`px-3 py-2 rounded-t-md flex items-center ${
                  activeFilter === filter.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                    : 'hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {filter.icon}
                {filter.label}
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {questions.filter(q => {
                    if (filter.id === 'all') return true;
                    if (filter.id === 'unanswered') return !q.answered;
                    if (filter.id === 'important') return q.important;
                    return true;
                  }).length}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filter Info */}
      <div className="text-sm text-gray-600">
        <p>
          Showing {questions.filter(q => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'unanswered') return !q.answered;
            if (activeFilter === 'important') return q.important;
            return true;
          }).length} of {questions.length} questions
        </p>
      </div>
    </div>
  );
}
