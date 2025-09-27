import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiX, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import LectureCard from '../components/LectureCard';

export default function CoursePage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [lectures, setLectures] = useState([
    { 
      id: 'lecture1', 
      name: 'Lecture 1: Introduction to Course', 
      status: 'live',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000), // 1 hour from now
      description: 'Introduction to the course content and objectives'
    },
    { 
      id: 'lecture2', 
      name: 'Lecture 2: Advanced Topics', 
      status: 'completed',
      startTime: new Date(Date.now() - 86400000), // yesterday
      endTime: new Date(Date.now() - 82800000), // yesterday + 1 hour
      description: 'Deep dive into advanced concepts'
    },
    { 
      id: 'lecture3', 
      name: 'Lecture 3: Recap Session', 
      status: 'upcoming',
      startTime: new Date(Date.now() + 86400000), // tomorrow
      endTime: new Date(Date.now() + 90000000), // tomorrow + 1 hour
      description: 'Review of previous lectures and Q&A session'
    },
  ]);
  
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

  const handleCreateLecture = () => {
    if (!newLecture.name.trim()) {
      alert('Please enter a lecture name');
      return;
    }
    
    const newLectureId = `lecture${Date.now()}`; // Use timestamp for unique ID
    const startTime = new Date(newLecture.startTime);
    const endTime = new Date(newLecture.endTime);
    
    // Validate end time is after start time
    if (endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }

    const lectureToAdd = {
      id: newLectureId,
      name: newLecture.name,
      description: newLecture.description,
      status: 'upcoming',
      startTime: startTime,
      endTime: endTime
    };
    
    // In a real app, you would save this to your backend here
    // await api.createLecture(courseId, lectureToAdd);
    
    // Update local state
    setLectures([...lectures, lectureToAdd]);
    
    // Reset form
    setNewLecture({
      name: '',
      description: '',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000)
    });
    
    setIsCreatingLecture(false);
  };

  const handleLectureClick = (lecture) => {
    if (lecture.status === 'live' || user?.role === 'teacher' || user?.role === 'ta') {
      navigate(`/lectures/${lecture.id}`, { 
        state: { 
          lecture: {
            ...lecture,
            courseId: courseId,
            courseName: `Course ${courseId}`,
            isPast: lecture.status === 'completed' // Add flag to indicate if this is a past lecture
          }
        } 
      });
    } else if (lecture.status === 'upcoming') {
      alert(`Lecture "${lecture.name}" has not started yet.`);
    } else {
      alert(`Lecture "${lecture.name}" has already ended.`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Course {courseId}</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsCreatingLecture(true)}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            <FiPlus className="mr-2" />
            Create New Lecture
          </button>
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
            {user?.name ? user.name.split(' ')[0] : 'Logout'}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lectures.map((lecture) => (
          <div 
            key={lecture.id}
            onClick={() => handleLectureClick(lecture)}
            className="cursor-pointer"
          >
            <LectureCard 
              lecture={lecture}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
