import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentResultsPage = () => {
  const [results, setResults] = useState(null);
  const [studentName, setStudentName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get student name
    const name = localStorage.getItem('studentName');
    setStudentName(name || 'Student');

    // Get results data from localStorage
    const resultsData = localStorage.getItem('pollResults');
    if (resultsData) {
      try {
        const parsedResults = JSON.parse(resultsData);
        console.log('Results data:', parsedResults);
        setResults(parsedResults);
      } catch (error) {
        console.error('Error parsing results data:', error);
      }
    }
  }, []);

  if (!results) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading results...</h2>
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
        <h2 style={{ color: '#373737', margin: 0 }}>Question</h2>
        <button
          style={{
            backgroundColor: '#7765DA',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          View Poll history
        </button>
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
        {results.question}
      </div>

      {/* Results */}
      <div style={{ marginBottom: '30px' }}>
        {results.results.map((option, index) => (
          <div
            key={option.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 0',
              marginBottom: '10px'
            }}
          >
            {/* Option Circle */}
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#7765DA',
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

            {/* Option Text and Progress Bar */}
            <div style={{ flex: 1 }}>
              {/* Progress Bar Container */}
              <div style={{
                backgroundColor: '#F2F2F2',
                borderRadius: '20px',
                height: '40px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Progress Bar Fill */}
                <div style={{
                  backgroundColor: '#7765DA',
                  height: '100%',
                  width: `${option.percentage}%`,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '15px',
                  color: 'white',
                  fontWeight: '500',
                  transition: 'width 0.5s ease'
                }}>
                  {option.text}
                </div>
                
                {/* Percentage Text */}
                <div style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: option.percentage > 50 ? 'white' : '#373737',
                  fontWeight: 'bold'
                }}>
                  {option.percentage}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Answers */}
      <div style={{
        textAlign: 'center',
        color: '#6E6E6E',
        marginBottom: '20px'
      }}>
        Total answers: {results.totalAnswers}
      </div>

      {/* Back to Waiting Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => navigate('/student/waiting')}
          style={{
            backgroundColor: '#7765DA',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Wait for Next Question
        </button>
      </div>
    </div>
  );
};

export default StudentResultsPage;