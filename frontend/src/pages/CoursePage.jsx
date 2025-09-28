import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiX, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { lecturesApi } from '../api/lectures';
import { coursesApi } from '../api/courses';
import { useLecture } from '../hooks/useLecture';
import LectureCard from '../components/LectureCard';

export default function CoursePage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { lectures, loading, error, refetch: refetchLectures } = useLecture(courseId);
  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  
  const [isCreatingLecture, setIsCreatingLecture] = useState(false);
  // Helper function to format date for datetime-local input
  const formatForInput = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [newLecture, setNewLecture] = useState({
    name: '',
    description: '',
    startTime: formatForInput(new Date()),
    endTime: formatForInput(new Date(Date.now() + 3600000)) // Default to 1 hour from now
  });

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await coursesApi.getCourseById(courseId);
        setCourse(courseData);
      } catch (err) {
        console.error('Failed to fetch course:', err);
      } finally {
        setCourseLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleCreateLecture = async () => {
    if (!newLecture.name.trim()) {
      alert('Please enter a lecture name');
      return;
    }

    const startTime = new Date(newLecture.startTime);
    const endTime = new Date(newLecture.endTime);

    if (endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      const lectureData = {
        title: newLecture.name,
        description: newLecture.description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      await lecturesApi.createLecture(courseId, lectureData);
      
      // Refetch lectures to update the list
      refetchLectures();

      // Reset form and close modal
      setNewLecture({
        name: '',
        description: '',
        startTime: formatForInput(new Date()),
        endTime: formatForInput(new Date(Date.now() + 3600000))
      });
      setIsCreatingLecture(false);
    } catch (err) {
      console.error('Failed to create lecture:', err);
      alert('Failed to create lecture. Please try again.');
    }
  };

  const handleLectureClick = (lecture) => {
    if (user?.role === 'instructor' || user?.role === 'ta') {
      navigate(`/lectures/${lecture._id}`, { state: { lecture } });
    } 
    else if (lecture.status === 'live') {
      navigate(`/lectures/${lecture._id}`, { state: { lecture } });
    } else if (lecture.status === 'upcoming') {
      alert(`Lecture "${lecture.title}" has not started yet.`);
    } else {
      alert(`Lecture "${lecture.title}" has already ended.`);
    }
  };

  // Handle loading states
  if (courseLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold">Loading course...</p>
          <p className="text-gray-500 mt-2">Please wait while we load the course data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{course?.title || 'Course'}</h1>
        <div className="flex items-center space-x-4">
          {(user?.role === 'instructor' || user?.role === 'ta') && (
            <button 
              onClick={() => setIsCreatingLecture(true)}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              <FiPlus className="mr-2" />
              Create New Lecture
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                logout();
              }
            }}
            className="flex items-center text-gray-700 hover:text-gray-900"
            title="Logout"
          >
            <FiLogOut className="mr-1" />
            Logout
          </button>
        </div>
      </div>
      
      {/* New Lecture Form Modal */}
      {isCreatingLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsCreatingLecture(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
            
            <h2 className="text-xl font-bold mb-4">Create New Lecture</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  value={newLecture.name}
                  onChange={(e) => setNewLecture({...newLecture, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="E.g., Introduction to React"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newLecture.description}
                  onChange={(e) => setNewLecture({...newLecture, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Brief description of the lecture"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newLecture.startTime}
                    onChange={(e) => {
                      const start = e.target.value;
                      const startDate = new Date(start);
                      const endDate = new Date(startDate.getTime() + 3600000); // Default 1 hour duration
                      
                      setNewLecture({
                        ...newLecture,
                        startTime: start,
                        endTime: formatForInput(endDate)
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newLecture.endTime}
                    onChange={(e) => setNewLecture({
                      ...newLecture,
                      endTime: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreatingLecture(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateLecture}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  disabled={!newLecture.name.trim()}
                >
                  Create Lecture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {loading && <div className="text-center">Loading lectures...</div>}
      {error && <div className="text-center text-red-500">Failed to load lectures.</div>}
      {!loading && !error && (
        lectures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lectures.map((lecture) => (
              <div 
                key={lecture._id}
                onClick={() => handleLectureClick(lecture)}
                className="cursor-pointer"
              >
                <LectureCard lecture={lecture} />
              </div>
            ))}
          </div>
        ) : (
          <p>No lectures have been created for this course yet.</p>
        )
      )}
    </div>
  );
}
