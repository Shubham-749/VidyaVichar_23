import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { courses } = useCourses();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Welcome, {user?.email} <span className="text-blue-600">({user?.role})</span>
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => handleViewCourse(course.id)} // pass click handler
          />
        ))}
      </div>
    </div>
  );
}
