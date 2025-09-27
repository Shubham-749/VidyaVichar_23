import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiFilter, FiX, FiCheck, FiStar, FiTrash2, FiMoreVertical } from 'react-icons/fi';

const Whiteboard = ({ user, questions = [], onQuestionAction, onAddQuestion }) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, question: null });
  const [positions, setPositions] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const boardRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const boardRect = useRef({ width: 0, height: 0, left: 0, top: 0 });

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
    
    onAddQuestion({
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

    updateBoardRect();
    window.addEventListener('resize', updateBoardRect);
    return () => window.removeEventListener('resize', updateBoardRect);
  }, []);

  // Initialize positions for new questions
  useEffect(() => {
    const newPositions = {};
    const boardWidth = boardRef.current?.clientWidth || 800;
    const boardHeight = boardRef.current?.clientHeight || 600;
    
    questions.forEach(question => {
      if (!positions[question.id]) {
        newPositions[question.id] = {
          x: Math.random() * (boardWidth - 200), // 200 is the width of the sticky note
          y: Math.random() * (boardHeight - 150) // 150 is an estimated height
        };
      }
    });
    
    if (Object.keys(newPositions).length > 0) {
      setPositions(prev => ({
        ...prev,
        ...newPositions
      }));
    }
  }, [questions]);

  const filteredQuestions = questions.filter(question => {
    if (filter === 'answered') return question.answered;
    if (filter === 'unanswered') return !question.answered;
    if (filter === 'important') return question.important;
    return true;
  });

  const handleContextMenu = (e, question) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      question
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleAction = (action, question) => {
    onQuestionAction(action, question);
    closeContextMenu();
  };

  const handleMouseDown = (e, question) => {
    if (e.button !== 0) return; // Only left mouse button
    
    const target = e.currentTarget;
    const boardRect = boardRef.current.getBoundingClientRect();
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
    const startLeft = parseFloat(target.style.left) || 0;
    const startTop = parseFloat(target.style.top) || 0;
    
    const handleMouseMove = (e) => {
      // Calculate new position based on mouse movement
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      // Calculate boundaries
      const maxX = boardRect.width - target.offsetWidth;
      const maxY = boardRect.height - target.offsetHeight;
      
      // Calculate new position with boundaries
      let newX = startLeft + dx;
      let newY = startTop + dy;
      
      // Apply boundaries
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      
      // Update position
      target.style.left = `${newX}px`;
      target.style.top = `${newY}px`;
      
      // Prevent text selection during drag
      e.preventDefault();
    };
    
    const handleMouseUp = (e) => {
      // Update the final position in state
      const finalLeft = parseFloat(target.style.left);
      const finalTop = parseFloat(target.style.top);
      
      setPositions(prev => ({
        ...prev,
        [question.id]: { 
          x: isNaN(finalLeft) ? 0 : finalLeft, 
          y: isNaN(finalTop) ? 0 : finalTop 
        }
      }));
      
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
    <div className="h-full flex flex-col" ref={boardRef}>
      {/* Header with filter and new question */}
      <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unanswered')}
            className={`px-3 py-1 rounded-md ${filter === 'unanswered' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Unanswered
          </button>
          <button
            onClick={() => setFilter('answered')}
            className={`px-3 py-1 rounded-md ${filter === 'answered' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Answered
          </button>
          <button
            onClick={() => setFilter('important')}
            className={`px-3 py-1 rounded-md flex items-center ${filter === 'important' ? 'bg-yellow-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <FiStar className="mr-1" /> Important
          </button>
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Questions</option>
            <option value="unanswered">Unanswered</option>
            <option value="answered">Answered</option>
            <option value="important">Important</option>
          </select>
          <FiFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        
        {user.role === 'teacher' && (
          <button
            onClick={() => {
              if (window.confirm('Clear all questions? This cannot be undone.')) {
                onQuestionAction('clear-all');
              }
            }}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
            title="Clear all questions"
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </div>

      {/* New question form */}
      <form onSubmit={handleSubmit} className="mt-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => {
              setNewQuestion(e.target.value);
              setError('');
            }}
            placeholder="Type your question and press Enter..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Ask
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2 ml-2">{error}</div>}
      </form>

      {/* Whiteboard area */}
      <div 
        ref={boardRef}
        className="flex-1 relative overflow-hidden bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
        onDragOver={(e) => e.preventDefault()}
      >
        {filteredQuestions.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            {filter === 'all' ? 'No questions yet. Be the first to ask!' : 'No matching questions.'}
          </div>
        ) : (
          <div className="absolute inset-0">
            {filteredQuestions.map((question) => {
              const position = positions[question.id] || { x: 0, y: 0 };
              return (
                <div
                  key={question.id}
                  className={`absolute p-4 rounded-lg shadow-md w-64 select-none transition-all ${
                    question.important ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-white border border-gray-200'
                  } ${question.answered ? 'opacity-70' : ''} cursor-move`}
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    zIndex: 1,
                    userSelect: 'none',
                    touchAction: 'none',
                    transform: isDragging && dragItem?.id === question.id ? 'scale(1.02)' : 'scale(1)'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, question)}
                  onContextMenu={(e) => handleContextMenu(e, question)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={`text-sm ${question.answered ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {question.text}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {question.user}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, question);
                      }}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <FiMoreVertical size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Context Menu */}
        {contextMenu.visible && contextMenu.question && (
          <div 
            className="fixed bg-white shadow-lg rounded-md py-1 z-50 w-40"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleAction('toggle-answered', contextMenu.question)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
            >
              {contextMenu.question.answered ? (
                <>
                  <FiX className="mr-2 text-red-500" />
                  Mark as Unanswered
                </>
              ) : (
                <>
                  <FiCheck className="mr-2 text-green-500" />
                  Mark as Answered
                </>
              )}
            </button>
            <button
              onClick={() => handleAction('toggle-important', contextMenu.question)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
            >
              <FiStar 
                className={`mr-2 ${contextMenu.question.important ? 'text-yellow-500 fill-current' : 'text-gray-500'}`} 
              />
              {contextMenu.question.important ? 'Unmark Important' : 'Mark Important'}
            </button>
            <button
              onClick={() => handleAction('delete', contextMenu.question)}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center"
            >
              <FiTrash2 className="mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;
