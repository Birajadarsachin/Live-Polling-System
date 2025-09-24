import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const StudentWaitingPage = () => {
  const [socket, setSocket] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get student name from localStorage
    const name = localStorage.getItem('studentName');
    setStudentName(name || 'Student');
    console.log('Student name:', name);

    // Connect to socket
    const newSocket = io('http://localhost:5000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Student connected to server:', newSocket.id);
      setIsConnected(true);
      
      // Join as student immediately after connection
      console.log('Emitting join-as-student with name:', name);
      newSocket.emit('join-as-student', { name: name || 'Student' });
    });

    newSocket.on('disconnect', () => {
      console.log('Student disconnected from server');
      setIsConnected(false);
    });

    // Listen for questions from teacher
    newSocket.on('new-question', (questionData) => {
      console.log('=== STUDENT RECEIVED QUESTION ===');
      console.log('Question data:', questionData);
      
      // Store question data and navigate to question page
      localStorage.setItem('currentQuestion', JSON.stringify(questionData));
      console.log('Stored question in localStorage, navigating to /student/question');
      navigate('/student/question');
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      console.log('Cleaning up socket connection');
      if (newSocket) {
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('new-question');
        newSocket.off('connect_error');
        newSocket.disconnect();
      }
    };
  }, [navigate]);

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Header Badge */}
      <div style={{ 
        backgroundColor: '#7765DA', 
        color: 'white', 
        padding: '8px 16px', 
        borderRadius: '20px', 
        display: 'inline-block',
        marginBottom: '40px'
      }}>
        📊 Intervue Poll
      </div>
      
      {/* Loading Spinner */}
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #7765DA',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '30px'
      }}>
      </div>
      
      {/* Message */}
      <h2 style={{ 
        color: '#373737', 
        fontSize: '24px',
        marginBottom: '10px'
      }}>
        Wait for the teacher to ask questions..
      </h2>
      
      <p style={{ 
        color: '#6E6E6E', 
        fontSize: '16px',
        marginBottom: '20px'
      }}>
        Welcome {studentName}! You'll see questions here when the teacher starts a poll.
      </p>

      {/* Connection Status */}
      <div style={{ 
        marginTop: '20px',
        padding: '10px 20px',
        borderRadius: '20px',
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        color: isConnected ? '#155724' : '#721c24',
        fontSize: '14px',
        border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        {isConnected ? '🟢 Connected - Ready to receive questions' : '🔴 Connecting...'}
      </div>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StudentWaitingPage;