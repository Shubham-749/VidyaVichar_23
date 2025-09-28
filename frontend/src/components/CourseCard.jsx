import React from 'react';

export default function CourseCard({ course, onClick }) {
  return (
    <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl cursor-pointer transform hover:-translate-y-1 transition-all"
    >
    <h2 className="text-2xl font-semibold text-gray-800">{course.title}</h2>
    <p className="text-gray-500 mt-2">View course materials and lectures.</p>
    <div className="mt-4 flex justify-end">
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
        View
        </span>
    </div>
    </div>

  );
}
