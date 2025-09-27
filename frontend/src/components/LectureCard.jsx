import React from 'react';
import { FiClock, FiCheckCircle, FiPlayCircle } from 'react-icons/fi'
import { format, isAfter, isBefore } from 'date-fns';

const statusConfig = {
  upcoming: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <FiClock className="mr-1.5" />,
    label: 'Upcoming'
  },
  live: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <FiPlayCircle className="mr-1.5" />,
    label: 'Live Now'
  },
  completed: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <FiCheckCircle className="mr-1.5" />,
    label: 'Completed'
  }
};

export default function LectureCard({ 
  lecture, 
  onClick,
  showCourse = false,
  className = ''
}) {
  const { name, status, startTime, endTime, courseName } = lecture;
  const config = statusConfig[status] || statusConfig.upcoming;
  
  const formatTime = (time) => {
    try {
      return format(new Date(time), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return time;
    }
  };

  const isActive = status === 'live';
  const isPast = status === 'completed';

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${className} ${
        isActive ? 'ring-2 ring-green-400' : 'hover:border-gray-300'
      }`}
    >
      {/* Status indicator bar */}
      <div 
        className={`h-1 w-full ${
          isActive ? 'bg-green-500' : 
          isPast ? 'bg-gray-400' : 'bg-yellow-400'
        }`}
      ></div>
      
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            
            {showCourse && courseName && (
              <p className="text-sm text-gray-600 mt-1">{courseName}</p>
            )}
            
            <div className="mt-3 space-y-1">
              {startTime && (
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="inline-block w-20">Starts:</span>
                  <span>{formatTime(startTime)}</span>
                </p>
              )}
              {endTime && (
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="inline-block w-20">Ends:</span>
                  <span>{formatTime(endTime)}</span>
                </p>
              )}
            </div>
          </div>
          
          <span 
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color} ${config.color.includes('border') ? 'border' : ''}`}
          >
            {config.icon}
            {config.label}
          </span>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="inline-flex items-center text-sm text-gray-500">
            {isActive ? (
              <span className="flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            ) : null}
            {isActive ? 'Happening now' : isPast ? 'Lecture ended' : 'Scheduled'}
          </span>
          
          <button 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            {isPast ? 'View Details' : isActive ? 'Join Now' : 'View'}
          </button>
        </div>
      </div>
    </div>
  );
}
