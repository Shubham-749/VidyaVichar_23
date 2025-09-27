import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiCheck, FiStar, FiTrash2, FiMoreVertical } from 'react-icons/fi';

const Whiteboard = ({ user, questions = [], onQuestionAction, onAddQuestion }) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, question: null });
  const [positions, setPositions] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const boardRef = useRef(null);
  const boardRect = useRef({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      setError('Question cannot be empty');
      return;
    }
    
    if (questions.some(q => q.text.toLowerCase() === newQuestion.toLowerCase())) {
      setError('This question has already been asked');
      return;
    }
    
    // Use onQuestionAction with 'add' action
    onQuestionAction('add', {
      text: newQuestion,
      user: user.name || 'Anonymous',
      userId: user.id,
      timestamp: new Date().toISOString(),
      answered: false,
      important: false
    });
    
    setNewQuestion('');
    setError('');
  };

  // Update board dimensions on resize and mount
  useEffect(() => {
    const updateBoardRect = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        boardRect.current = {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top
        };
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging || !dragItem) return;

      const boardBounds = boardRect.current;
      const minX = 5; // 5% from left
      const maxX = 95; // 5% from right
      const minY = 5; // 5% from top
      const maxY = 95; // 5% from bottom
      
      // Calculate position as percentage of board
      let x = ((e.clientX - boardBounds.left) / boardBounds.width) * 100;
      let y = ((e.clientY - boardBounds.top) / boardBounds.height) * 100;
      
      // Constrain to boundaries
      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));

      setPositions(prev => ({
        ...prev,
        [dragItem.id]: { x, y }
      }));
    };

    updateBoardRect();
    window.addEventListener('resize', updateBoardRect);
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', updateBoardRect);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, dragItem]);

  // Initialize positions for new questions
  useEffect(() => {
    const newPositions = {};
    
    questions.forEach(question => {
      if (!positions[question.id] && !question.position) {
        // Position new notes within 20% to 80% of the whiteboard
        newPositions[question.id] = {
          x: 20 + Math.random() * 60, // 20% to 80%
          y: 20 + Math.random() * 60  // 20% to 80%
        };
      } else if (question.position) {
        // Use saved position if it exists
        newPositions[question.id] = question.position;
      }
    });

    if (Object.keys(newPositions).length > 0) {
      setPositions(prev => ({
        ...prev,
        ...newPositions
      }));
    }
  }, [questions.length]); // Only run when number of questions changes

  // Use questions directly since filtering is handled by the parent component
  const filteredQuestions = questions;

  // Check if user is a teacher/TA in a past lecture
  const isTeacherInPastLecture = user.role === 'viewer' || user.role === 'teacher' || user.role === 'ta';
  
  // Handle mark all as answered
  const handleMarkAllAnswered = () => {
    filteredQuestions.forEach(q => {
      if (!q.answered) {
        onQuestionAction('toggleAnswered', q);
      }
    });
  };

  // Handle clear all questions
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all questions?')) {
      filteredQuestions.forEach(q => {
        onQuestionAction('delete', q);
      });
    }
  };

  const handleMouseDown = (e, question) => {
    e.preventDefault();
    if (e.button !== 0) return; // Only left mouse button
    
    const target = e.currentTarget;
    const boardBounds = boardRef.current.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    
    // Calculate the offset from the mouse to the top-left corner of the note
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Set initial styles
    target.style.transition = 'none';
    target.style.zIndex = '1000';
    target.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    
    // Store initial positions
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Get current position from state or default to current position
    const currentPos = positions[question.id] || { x: 0, y: 0 };
    
    const handleMouseMove = (e) => {
      // Calculate new position based on mouse movement
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      // Calculate new position in percentages
      const newX = (currentPos.x || 0) + (dx / boardBounds.width * 100);
      const newY = (currentPos.y || 0) + (dy / boardBounds.height * 100);
      
      // Update position in state
      setPositions(prev => ({
        ...prev,
        [question.id]: {
          x: Math.max(0, Math.min(newX, 95)), // Keep within 0-95% of container
          y: Math.max(0, Math.min(newY, 95))
        }
      }));
      
      // Prevent text selection during drag
      e.preventDefault();
    };
    
    const handleMouseUp = () => {
      // Clean up styles
      target.style.transition = 'all 0.2s ease';
      target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      target.style.zIndex = '1';
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
    
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.visible]);

  return (
    <div className="h-full w-full flex flex-col bg-white rounded-lg border-2 border-dashed border-gray-200 overflow-hidden" ref={boardRef}>
      {/* Top Toolbar */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm p-2 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-700">Whiteboard</h3>
        </div>
        
        {!isTeacherInPastLecture && (user.role === 'teacher' || user.role === 'ta') && (
          <div className="flex space-x-2">
            <button
              onClick={handleMarkAllAnswered}
              className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Mark all as answered"
            >
              <FiCheck className="mr-1.5" />
              <span>Mark All Answered</span>
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Clear all questions"
            >
              <FiTrash2 className="mr-1.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Whiteboard Content */}
      <div className="flex-1 min-h-0 flex flex-col relative" style={{ minHeight: '500px', overflow: 'hidden' }}>
        {/* Question input form - show for all users in active lectures */}
        {onQuestionAction && (
          <div className="p-4 z-10 relative bg-white border-b border-gray-200">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Ask
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </form>
          </div>
        )}

        {/* Questions grid */}
        <div className="flex-1 p-4 overflow-auto" style={{ marginTop: '0' }}>
          {filteredQuestions.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <FiMessageSquare className="w-12 h-12 mb-4 opacity-30" />
              <p>No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            <div className="relative w-full h-full overflow-hidden" style={{ minHeight: '400px', position: 'relative' }}>
              {filteredQuestions.map((q, index) => {
                const position = positions[q.id] || {
                  x: 20 + Math.random() * 60,
                  y: 20 + Math.random() * 60
                };
                
                return (
                  <div
                    key={q.id || index}
                    className={`absolute p-4 rounded-lg shadow-md ${q.important ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-white'} ${q.answered ? 'opacity-75' : ''}`}
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'grab',
                      zIndex: 1,
                      width: '250px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, q)}
                    onContextMenu={(e) => handleContextMenu(e, q)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className="font-medium text-sm text-gray-900">{q.user || 'Anonymous'}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          {new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {(user.role === 'teacher' || user.role === 'ta') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuestionAction('toggleImportant', q);
                            }}
                            className={`p-1 rounded-full ${q.important ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}
                            title={q.important ? 'Mark as not important' : 'Mark as important'}
                          >
                            <FiStar className={q.important ? 'fill-current' : ''} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuestionAction('toggleAnswered', q);
                          }}
                          className={`p-1 ${q.answered ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
                          title={q.answered ? 'Mark as unanswered' : 'Mark as answered'}
                        >
                          <FiCheck />
                        </button>
                        {(user.role === 'teacher' || (user.role === 'ta' && q.userId === user.id)) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this question?')) {
                                onQuestionAction('delete', q);
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Delete question"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-800">{q.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
