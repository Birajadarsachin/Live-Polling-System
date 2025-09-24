import React, { useState } from 'react';
import io from 'socket.io-client';

const LandingPage = () => {
  const [selectedRole, setSelectedRole] = useState('');

  // Test socket connection
  const testConnection = () => {
    const socket = io('http://localhost:5000');
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    testConnection(); // Test socket connection
  };

  const handleContinue = () => {
  if (selectedRole === 'student') {
    window.location.href = '/student';
  } else if (selectedRole === 'teacher') {
    window.location.href = '/teacher';
  }
};

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ 
        backgroundColor: '#7765DA', 
        color: 'white', 
        padding: '8px 16px', 
        borderRadius: '20px', 
        display: 'inline-block',
        marginBottom: '30px'
      }}>
        📊 Intervue Poll
      </div>
      
      <h1>Welcome to the Live Polling System</h1>
      <p>Please select the role that best describes you to begin using the live polling system</p>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', margin: '30px 0' }}>
        <div 
          onClick={() => handleRoleSelect('student')}
          style={{
            border: selectedRole === 'student' ? '2px solid #7765DA' : '2px solid #ddd',
            borderRadius: '10px',
            padding: '20px',
            width: '200px',
            cursor: 'pointer',
            backgroundColor: selectedRole === 'student' ? '#f8f7ff' : 'white'
          }}
        >
          <h3>I'm a Student</h3>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
        </div>
        
        <div 
          onClick={() => handleRoleSelect('teacher')}
          style={{
            border: selectedRole === 'teacher' ? '2px solid #7765DA' : '2px solid #ddd',
            borderRadius: '10px',
            padding: '20px',
            width: '200px',
            cursor: 'pointer',
            backgroundColor: selectedRole === 'teacher' ? '#f8f7ff' : 'white'
          }}
        >
          <h3>I'm a Teacher</h3>
          <p>Submit answers and view live poll results in real-time.</p>
        </div>
      </div>
      
      <button 
        onClick={handleContinue}
        disabled={!selectedRole}
        style={{
          backgroundColor: selectedRole ? '#7765DA' : '#ccc',
          color: 'white',
          padding: '12px 30px',
          border: 'none',
          borderRadius: '25px',
          cursor: selectedRole ? 'pointer' : 'not-allowed',
          fontSize: '16px'
        }}
      >
        Continue
      </button>
    </div>
  );
};

export default LandingPage;