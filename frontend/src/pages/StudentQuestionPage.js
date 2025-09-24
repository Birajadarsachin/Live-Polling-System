import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const StudentQuestionPage = () => {
  const [socket, setSocket] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('StudentQuestionPage mounted');
    
    // Get student name
    const name = localStorage.getItem('studentName');
    setStudentName(name || 'Student');

    // Get question data from localStorage
    const questionData = localStorage.getItem('currentQuestion');
    console.log('Question data from localStorage:', questionData);
    
    if (questionData) {
      try {
        const parsedQuestion = JSON.parse(questionData);
        console.log('Parsed question:', parsedQuestion);
        setQuestion(parsedQuestion);
        setTimeLeft(parsedQuestion.timer || 60);
      } catch (error) {
        console.error('Error parsing question data:', error);
      }
    }

    // Connect to socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join as student
    newSocket.emit('join-as-student', { name: name || 'Student' });

    // Listen for results - UPDATED LINE HERE
    newSocket.on('show-results', (resultsData) => {
      console.log('Results received:', resultsData);
      localStorage.setItem('pollResults', JSON.stringify(resultsData));
      navigate('/student/results');
    });

    return () => {
      newSocket.close();
    };
  }, [navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !hasSubmitted && question) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !hasSubmitted) {
      handleAutoSubmit();
    }
  }, [timeLeft, hasSubmitted, question]);

  const handleAutoSubmit = () => {
    console.log('Auto-submitting due to timeout');
    setHasSubmitted(true);
    if (socket) {
      socket.emit('submit-answer', {
        studentName,
        questionId: question?.id,
        selectedOption: selectedOption,
        isTimeout: true
      });
    }
  };

  const handleOptionSelect = (optionId) => {
    console.log('Option selected:', optionId);
    if (!hasSubmitted) {
      setSelectedOption(optionId);
    }
  };

  const handleSubmit = () => {
    if (selectedOption && !hasSubmitted && socket) {
      console.log('Submitting answer:', selectedOption);
      setHasSubmitted(true);
      socket.emit('submit-answer', {
        studentName,
        questionId: question?.id,
        selectedOption: selectedOption,
        isTimeout: false
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!question) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading question...</h2>
        <p>Checking for question data...</p>
        <button 
          onClick={() => navigate('/student/waiting')}
          style={{
            backgroundColor: '#7765DA',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          Back to Waiting
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ color: '#373737', margin: 0 }}>Question 1</h2>
        <div style={{ 
          color: timeLeft <= 10 ? '#ff4444' : '#373737',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question */}
      <div style={{
        backgroundColor: '#373737',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '18px'
      }}>
        {question.question}
      </div>

      {/* Options */}
      <div style={{ marginBottom: '30px' }}>
        {question.options && question.options.map((option, index) => (
          <div
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '8px',
              border: selectedOption === option.id ? '2px solid #7765DA' : '2px solid #F2F2F2',
              backgroundColor: selectedOption === option.id ? '#f8f7ff' : '#F2F2F2',
              cursor: hasSubmitted ? 'not-allowed' : 'pointer',
              opacity: hasSubmitted ? 0.7 : 1
            }}
          >
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: selectedOption === option.id ? '#7765DA' : '#6E6E6E',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {String.fromCharCode(65 + index)}
            </div>
            <span style={{ 
              fontSize: '16px',
              color: '#373737'
            }}>
              {option.text}
            </span>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      {!hasSubmitted && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            style={{
              backgroundColor: selectedOption ? '#7765DA' : '#ccc',
              color: 'white',
              padding: '15px 40px',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: selectedOption ? 'pointer' : 'not-allowed'
            }}
          >
            Submit
          </button>
        </div>
      )}

      {/* Submitted Message */}
      {hasSubmitted && (
        <div style={{ 
          textAlign: 'center',
          color: '#7765DA',
          fontSize: '18px',
          fontWeight: '500'
        }}>
          Answer submitted! Waiting for results...
        </div>
      )}
    </div>
  );
};

export default StudentQuestionPage;