import React from 'react';
import { FiMessageSquare, FiStar, FiCheck, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function QuestionList({ questions = [], onQuestionAction, currentUserId }) {
  if (!questions.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiMessageSquare className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-2">No questions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div
          key={question.id}
          className={`relative p-4 rounded-lg shadow-sm border ${
            question.important ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
          } ${question.answered ? 'opacity-75' : ''}`}
        >
          {/* Question header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {question.important && (
                <FiStar className="text-yellow-500 mr-2" />
              )}
              <h3 className={`font-medium ${question.answered ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {question.text}
              </h3>
            </div>
            
            {/* Action buttons */}
            {onQuestionAction && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onQuestionAction(question.id, { important: !question.important })}
                  className={`p-1 rounded-full ${
                    question.important 
                      ? 'text-yellow-500 hover:bg-yellow-100' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  aria-label={question.important ? 'Mark as not important' : 'Mark as important'}
                >
                  <FiStar className={question.important ? 'fill-current' : ''} />
                </button>
                
                <button
                  onClick={() => onQuestionAction(question.id, { answered: !question.answered })}
                  className={`p-1 rounded-full ${
                    question.answered 
                      ? 'text-green-500 hover:bg-green-100' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  aria-label={question.answered ? 'Mark as unanswered' : 'Mark as answered'}
                >
                  <FiCheck className={question.answered ? 'fill-current' : ''} />
                </button>
                
                <button
                  onClick={() => onQuestionAction(question.id, { deleted: true })}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                  aria-label="Delete question"
                >
                  <FiTrash2 />
                </button>
              </div>
            )}
          </div>
          
          {/* Question footer */}
          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
            <span>Asked by {question.user}</span>
            {question.timestamp && (
              <span className="text-xs">
                {formatDistanceToNow(new Date(question.timestamp), { addSuffix: true })}
              </span>
            )}
          </div>
          
          {/* Answered indicator */}
          {question.answered && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FiCheck className="mr-1" /> Answered
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
