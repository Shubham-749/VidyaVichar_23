import React from 'react';

export default function StickyNote({ question }) {
  const bgColor = question.important ? 'bg-yellow-200' : 'bg-blue-100';
  const textStyle = question.answered ? 'line-through text-gray-400' : '';

  return (
    <div
      className={`p-4 rounded shadow-md ${bgColor} ${textStyle} transition-all`}
    >
      <p className="font-medium">{question.text}</p>
      <span className="text-sm text-gray-600 mt-1 block">- {question.user}</span>
    </div>
  );
}
