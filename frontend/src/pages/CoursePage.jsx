import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LectureCard from '../components/LectureCard';

export default function CoursePage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const lectures = [
    { 
      id: 'lecture1', 
      name: 'Lecture 1: Intro', 
      status: 'live',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000) // 1 hour from now
    },
    { 
      id: 'lecture2', 
      name: 'Lecture 2: Advanced', 
      status: 'completed',
      startTime: new Date(Date.now() - 86400000), // yesterday
      endTime: new Date(Date.now() - 82800000) // yesterday + 1 hour
    },
    { 
      id: 'lecture3', 
      name: 'Lecture 3: Recap', 
      status: 'upcoming',
      startTime: new Date(Date.now() + 86400000), // tomorrow
      endTime: new Date(Date.now() + 90000000) // tomorrow + 1 hour
    },
  ];

  const handleCreateLecture = () => {
    // In a real app, this would open a form to create a new lecture
    const newLectureId = `lecture${lectures.length + 1}`;
    const newLecture = {
      id: newLectureId,
      name: `Lecture ${lectures.length + 1}: New Lecture`,
      status: 'upcoming',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000)
    };
    // In a real app, you would save this to your backend
    alert(`Created new lecture: ${newLecture.name}`);
  };

  const handleLectureClick = (lecture) => {
    if (lecture.status === 'live') {
      navigate(`/lectures/${lecture.id}`, { 
        state: { 
          lecture: {
            ...lecture,
            courseId: courseId,
            courseName: `Course ${courseId}`
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
        <button 
          onClick={handleCreateLecture}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Lecture
        </button>
      </div>
      
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
