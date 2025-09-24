import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentPage = () => {
  const [studentName, setStudentName] = useState('');
  const navigate = useNavigate(); // This should be INSIDE the component

  const handleContinue = () => {
    if (studentName.trim()) {
      // Store name in localStorage for this tab
      localStorage.setItem('studentName', studentName);
      console.log('Student name saved:', studentName);
      // Navigate to waiting page
      navigate('/student/waiting');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
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
      
      {/* Title */}
      <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#373737' }}>
        Let's Get Started
      </h1>
      
      {/* Description */}
      <p style={{ 
        color: '#6E6E6E', 
        fontSize: '16px', 
        marginBottom: '40px',
        lineHeight: '1.5'
      }}>
        If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
      </p>
      
      {/* Name Input Section */}
      <div style={{ marginBottom: '40px' }}>
        <label style={{ 
          display: 'block', 
          textAlign: 'left', 
          marginBottom: '10px',
          color: '#373737',
          fontWeight: '500'
        }}>
          Enter your Name
        </label>
        
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Rahul Bajaj"
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#F2F2F2',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>
      
      {/* Continue Button */}
      <button 
        onClick={handleContinue}
        disabled={!studentName.trim()}
        style={{
          backgroundColor: studentName.trim() ? '#7765DA' : '#ccc',
          color: 'white',
          padding: '15px 40px',
          border: 'none',
          borderRadius: '25px',
          cursor: studentName.trim() ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: '500',
          minWidth: '150px'
        }}
      >
        Continue
      </button>
    </div>
  );
};

export default StudentPage;