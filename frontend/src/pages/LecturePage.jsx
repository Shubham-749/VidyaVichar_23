import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FiArrowLeft, FiUsers, FiVideo, FiMic, FiPhoneOff } from 'react-icons/fi';
import Whiteboard from '../components/Whiteboard';
import TeacherControls from '../components/TeacherControls';

export default function LecturePage() {
  const { id: lectureId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  
  const [lecture, setLecture] = useState(state?.lecture || null);
  const [questions, setQuestions] = useState([]);
  const [participants, setParticipants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Handle updating a question
  const handleUpdateQuestion = useCallback((questionId, updates) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    );
    
    // Emit update to socket if connected
    if (socket) {
      socket.emit('updateQuestion', { questionId, updates });
    }
  }, [socket]);
  
  // Calculate filtered questions
  const filteredQuestions = questions.filter(q => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unanswered') return !q.answered;
    if (activeFilter === 'important') return q.important;
    return true;
  });
  
  // Initialize lecture data
  useEffect(() => {
    console.log('State from navigation:', state);
    console.log('Lecture ID from URL:', lectureId);
    
    if (state?.lecture) {
      console.log('Using lecture data from navigation state');
      setLecture(state.lecture);
      setLoading(false);
    } else {
      console.log('Generating mock lecture data');
      // Fallback mock data if no lecture is provided in state
      const mockLecture = {
        id: lectureId,
        name: `Lecture ${lectureId ? lectureId.split('lecture')[1] || '1' : '1'}`,
        status: 'live',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        courseId: '1',
        courseName: 'Course 1'
      };
      console.log('Mock lecture data:', mockLecture);
      setLecture(mockLecture);
      setLoading(false);
    }
  }, [state, lectureId]);

  // Handle question actions
  const handleQuestionAction = useCallback((action, question) => {
    switch (action) {
      case 'add':
        const newQuestion = {
          ...question,
          id: Date.now()
        };
        setQuestions(prev => [...prev, newQuestion]);
        break;
        
      case 'toggle-answered':
        setQuestions(prev => prev.map(q => 
          q.id === question.id ? { ...q, answered: !q.answered } : q
        ));
        break;
        
      case 'toggle-important':
        setQuestions(prev => prev.map(q => 
          q.id === question.id ? { ...q, important: !q.important } : q
        ));
        break;
        
      case 'delete':
        setQuestions(prev => prev.filter(q => q.id !== question.id));
        break;
        
      case 'clear-all':
        if (window.confirm('Are you sure you want to delete all questions?')) {
          setQuestions([]);
        }
        break;
        
      default:
        break;
    }
  }, []);

  // Fetch questions and set up socket listeners
  useEffect(() => {
    if (!lecture) return;
    
    const fetchQuestions = async () => {
      try {
        // Mock questions for demo
        const mockQuestions = [
          { 
            id: 1, 
            text: 'What is React?', 
            user: 'Student1', 
            userId: '1',
            answered: false, 
            important: false,
            timestamp: new Date().toISOString()
          },
          { 
            id: 2, 
            text: 'Explain JSX', 
            user: 'Student2', 
            userId: '2',
            answered: true, 
            important: true,
            timestamp: new Date().toISOString()
          },
        ];
        
        setQuestions(mockQuestions);
        setParticipants(Math.floor(Math.random() * 50) + 1);
        setLoading(false);
        
        // Set up WebSocket listeners in a real app
        if (socket) {
          // Example: socket.emit('join-lecture', { lectureId, userId: user?.id });
          socket.on('newQuestion', (newQuestion) => {
            setQuestions(prev => [...prev, newQuestion]);
          });
          
          socket.on('questionUpdated', (updatedQuestion) => {
            setQuestions(prev => 
              prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
            );
          });
        }
      } catch (err) {
        setError('Failed to load questions');
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchQuestions();

    return () => {
      // Cleanup WebSocket listeners
      if (socket) {
        socket.off('newQuestion');
        socket.off('questionUpdated');
      }
    };
  }, [lecture, socket, user?.id]);
  
  // Handle loading state
  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold">Loading lecture...</p>
          <p className="text-gray-500 mt-2">Please wait while we load the lecture data.</p>
        </div>
      </div>
    );
  }

  // Handle missing lecture data
  if (!lecture) {
    console.log('No lecture data available');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold">Lecture not found</p>
          <p className="text-gray-600 mt-2">The requested lecture could not be loaded.</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back to Course
          </button>
        </div>
      </div>
    );
  }

  // Leave lecture and go back
  const leaveLecture = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
        {/* Whiteboard section */}
        <div className="flex-1 flex flex-col border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{lecture?.name || 'Whiteboard'}</h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 flex items-center">
                  <FiUsers className="mr-1" /> {participants} participants
                </div>
                <button
                  onClick={leaveLecture}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                >
                  <FiArrowLeft className="mr-2" /> Leave
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <Whiteboard 
                user={user}
                questions={filteredQuestions}
                onQuestionAction={(action, question) => handleQuestionAction(action, question)}
                onAddQuestion={(question) => handleQuestionAction('add', question)}
              />
            </div>
          </div>
        </div>

        {/* Teacher Controls (only visible to teachers) */}
        {user?.role === 'teacher' && (
          <div className="mt-6">
            <TeacherControls 
              questions={questions}
              onUpdateQuestion={handleUpdateQuestion}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
        )}
      </div>
    </div>
  );
}
