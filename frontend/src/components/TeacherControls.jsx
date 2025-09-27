import React from 'react';
import { FiFilter, FiCheck, FiX, FiStar, FiMessageSquare } from 'react-icons/fi';

export default function TeacherControls({ 
  questions = [], 
  onUpdateQuestion,
  onQuestionAction,
  activeFilter,
  onFilterChange 
}) {
  const markAllAnswered = () => {
    questions.forEach(q => {
      if (!q.answered) {
        onUpdateQuestion(q.id, { answered: true });
      }
    });
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to delete all questions?')) {
      // Use onQuestionAction with 'clear-all' action to clear all questions
      onQuestionAction('clear-all');
    }
  };

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
                {activeFilter === filter.id && (
                  <span className="ml-1.5 py-0.5 px-1.5 rounded-full bg-blue-100 text-blue-600 text-xs">
                    {questions.filter(q => {
                      if (filter.id === 'all') return true;
                      if (filter.id === 'unanswered') return !q.answered;
                      if (filter.id === 'important') return q.important;
                      return true;
                    }).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={markAllAnswered}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FiCheck className="mr-2" />
          Mark All Answered
        </button>
        
        <button
          onClick={clearAll}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <FiX className="mr-2" />
          Clear All
        </button>
      </div>
    </div>
  );
}
