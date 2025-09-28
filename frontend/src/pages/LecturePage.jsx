import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FiArrowLeft, FiUsers, FiVideo, FiMic, FiPhoneOff } from 'react-icons/fi';
import Whiteboard from '../components/Whiteboard';
import TeacherControls from '../components/TeacherControls';
import { questionsApi } from '../api/questions';

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
    if (state?.lecture) {
      // If this is a past lecture and user is not a teacher/TA, redirect back
      if (state.lecture.status === 'completed' && !['instructor', 'ta'].includes(user?.role)) {
        alert('This lecture has already ended.');
        navigate(-1);
        return;
      }
      
      setLecture({
        ...state.lecture,
        isPast: state.lecture.status === 'completed'
      });
      setLoading(false);
    } else {
      if (!lectureId) {
          setError('Invalid lecture ID');
        setLoading(false);
        return;
      }
      
      // Fallback mock data if no lecture is provided in state
      const mockLecture = {
        _id: lectureId,
        name: `Lecture ${lectureId.split('lecture')[1] || '1'}`,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        courseId: '1',
        courseName: 'Course 1',
        isPast: false
      }
      setLecture(mockLecture);
      setLoading(false);
    }
  }, [state, lectureId, user, navigate]);

  // Handle question actions
  const handleQuestionAction = useCallback((action, question) => {
    // If this is a past lecture, don't allow any modifications
    if (lecture?.isPast) {
      alert('This is a past lecture. No modifications can be made.');
      return;
    }
    switch (action) {
      case 'add':
        if (!lecture || !lecture._id) {
          alert('Cannot add question: Lecture data is not available. Please refresh the page.');
          return;
        }
        const lectureId = lecture._id; // Capture lecture ID at this moment
        const addQuestionToBackend = async () => {
          try {
            const response = await questionsApi.askQuestion(lectureId, question.text);
            
            // Safety check for undefined response
            if (!response) {
              throw new Error('API returned undefined response');
            }
            
            // The backend returns the question object directly, not wrapped in data
            const questionData = response;
            
            // Safety check for question data
            if (!questionData || !questionData._id) {
              throw new Error('Invalid question data received from server');
            }
            
            const newQuestion = {
              ...questionData,
              id: questionData._id || questionData.id,
              text: questionData.content, // Map 'content' to 'text' for frontend compatibility
              answered: questionData.status === 'answered',
              important: questionData.isImportant
            };
            setQuestions(prev => [...prev, newQuestion]);
          } catch (error) {
            console.error('Error adding question:', error);
            
            // Check if it's a network error or axios configuration error
            if (error.code === 'ERR_NETWORK' || !error.response) {
              console.error('Network or configuration error:', error.message);
              alert('Network error: Unable to connect to the server. Please check if the backend is running.');
            } else {
              console.error('Error response:', error.response?.data);
              console.error('Error status:', error.response?.status);
              
              let errorMessage = 'Failed to add question';
              if (error.response?.data?.message) {
                errorMessage += `: ${error.response.data.message}`;
                if (error.response.data.details) {
                  errorMessage += ` (${JSON.stringify(error.response.data.details)})`;
                }
              } else if (error.message) {
                errorMessage += `: ${error.message}`;
              }
              
              alert(errorMessage);
            }
            
            // Fallback to local state if API fails
            const newQuestion = {
              ...question,
              id: Date.now(),
              answered: false,
              important: false
            };
            setQuestions(prev => [...prev, newQuestion]);
          }
        };
        addQuestionToBackend();
        break;
        
      case 'toggleImportant':
        const toggleImportantInBackend = async () => {
          try {
            await questionsApi.toggleImportant(question.id, !question.important);
            setQuestions(prev => 
              prev.map(q => 
                q.id === question.id ? { ...q, important: !q.important } : q
              ));
          } catch (error) {
            console.error('Error toggling important:', error);
          }
        };
        toggleImportantInBackend();
        break;
        
      case 'toggleAnswered':
        const toggleAnsweredInBackend = async () => {
          try {
            await questionsApi.updateQuestionStatus(question.id, !question.answered ? 'answered' : 'unanswered');
            setQuestions(prev => 
              prev.map(q => 
                q.id === question.id ? { ...q, answered: !q.answered } : q
              ));
          } catch (error) {
            console.error('Error toggling answered:', error);
          }
        };
        toggleAnsweredInBackend();
        break;
        
      case 'delete':
        setQuestions(prev => prev.filter(q => q.id !== question.id));
        // Emit to WebSocket in a real app
        if (socket) {
          socket.emit('deleteQuestion', question.id);
        }
        break;
        
      case 'clear-all':
        if (window.confirm('Are you sure you want to delete all questions?')) {
          setQuestions([]);
          // Emit to WebSocket in a real app
          if (socket) {
            socket.emit('clearQuestions', lecture._id);
          }
        }
        break;
        
      default:
        break;
    }
  }, [socket, lecture]);

  // Fetch questions and set up socket listeners
  useEffect(() => {
    if (!lecture || !lecture._id) {
      return;
    }
    
    const fetchQuestions = async () => {
      try {
        // Fetch questions from backend API
        const response = await questionsApi.getQuestionsByLecture(lecture._id);
        // The backend returns the array directly, not wrapped in a data property
        const mappedQuestions = (response || []).map(q => ({
          ...q,
          id: q._id || q.id,
          text: q.content, // Map 'content' to 'text'
          user: q.askedBy?.name || 'Anonymous', // Map populated user name
          userId: q.askedBy?._id || q.askedBy,
          answered: q.status === 'answered',
          important: q.isImportant
        }));
        setQuestions(mappedQuestions);
        setParticipants(Math.floor(Math.random() * 50) + 1);
        setLoading(false);
        
        // Set up WebSocket listeners in a real app
        if (socket) {
          // Example: socket.emit('join-lecture', { lectureId, userId: user?.id });
          socket.on('newQuestion', (newQuestion) => {
            // Map backend question fields to frontend expected fields
            const mappedQuestion = {
              ...newQuestion,
              id: newQuestion._id || newQuestion.id,
              text: newQuestion.content, // Map 'content' to 'text'
              user: newQuestion.askedBy?.name || 'Anonymous', // Map populated user name
              userId: newQuestion.askedBy?._id || newQuestion.askedBy,
              answered: newQuestion.status === 'answered',
              important: newQuestion.isImportant
            };
            setQuestions(prev => [...prev, mappedQuestion]);
          });
          
          socket.on('questionUpdated', (updatedQuestion) => {
            // Map backend question fields to frontend expected fields
            const mappedQuestion = {
              ...updatedQuestion,
              id: updatedQuestion._id || updatedQuestion.id,
              text: updatedQuestion.content, // Map 'content' to 'text'
              user: updatedQuestion.askedBy?.name || 'Anonymous', // Map populated user name
              userId: updatedQuestion.askedBy?._id || updatedQuestion.askedBy,
              answered: updatedQuestion.status === 'answered',
              important: updatedQuestion.isImportant
            };
            setQuestions(prev => 
              prev.map(q => q.id === mappedQuestion.id ? mappedQuestion : q)
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Lecture Not Found</h2>
          <p className="text-gray-600 mb-4">The requested lecture could not be loaded.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // Check if this is a past lecture
  const isPastLecture = lecture.isPast || new Date(lecture.endTime) < new Date();

  // Leave lecture and go back
  const leaveLecture = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Whiteboard section */}
        <div className="flex-1 flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-white shadow flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
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
          
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-gray-50 relative" style={{ minHeight: '600px' }}>
              <div className={isPastLecture ? 'opacity-75 absolute inset-0' : 'absolute inset-0'}>
                {isPastLecture && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          You are viewing a past lecture. This is a read-only view.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <Whiteboard 
                  user={isPastLecture ? { ...user, role: 'viewer' } : user}
                  questions={filteredQuestions}
                  onQuestionAction={(action, question) => handleQuestionAction(action, question)}
                  onAddQuestion={isPastLecture ? undefined : (question) => handleQuestionAction('add', question)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Controls (only visible to teachers and not in past lectures) */}
        {(user?.role === 'instructor' || user?.role === 'ta') && !isPastLecture && (
          <div className="mt-6">
            <TeacherControls 
              questions={questions}
              onUpdateQuestion={handleUpdateQuestion}
              onQuestionAction={handleQuestionAction}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
        )}
      </div>
    </div>
  );
}
