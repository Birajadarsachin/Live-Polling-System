import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const TeacherResultsPage = () => {
  const [socket, setSocket] = useState(null);
  const [results, setResults] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial results data
    const resultsData = localStorage.getItem('currentPollResults');
    if (resultsData) {
      try {
        const parsedResults = JSON.parse(resultsData);
        setResults(parsedResults);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing results data:', error);
      }
    }

    // Connect to socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join as teacher
    newSocket.emit('join-as-teacher');

    // Listen for updated results
    newSocket.on('results-updated', (updatedResults) => {
      console.log('Results updated:', updatedResults);
      setResults(updatedResults.results);
      setStudents(updatedResults.students);
      localStorage.setItem('currentPollResults', JSON.stringify(updatedResults.results));
    });

    // Listen for student list updates
    newSocket.on('students-updated', (studentList) => {
      console.log('Students updated:', studentList);
      setStudents(studentList);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleAskNewQuestion = () => {
    if (socket) {
      // Clear current poll
      socket.emit('clear-poll');
      localStorage.removeItem('currentPollResults');
    }
    // Navigate back to question creation
    navigate('/teacher');
  };

  const handleViewPollHistory = () => {
    alert('Poll history feature will be implemented later');
  };

  if (loading || !results) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading results...</h2>
        <button 
          onClick={() => navigate('/teacher')}
          style={{
            backgroundColor: '#7765DA',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          Back to Questions
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Main Results Section */}
        <div style={{ flex: 2 }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '30px' 
          }}>
            <h2 style={{ color: '#373737', margin: 0 }}>Question</h2>
            <button
              onClick={handleViewPollHistory}
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
            {results.results && results.results.map((option, index) => (
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

          {/* Ask New Question Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleAskNewQuestion}
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
              + Ask a new question
            </button>
          </div>
        </div>

        {/* Participants Panel */}
        <div style={{ flex: 1 }}>
          <div style={{
            border: '1px solid #F2F2F2',
            borderRadius: '10px',
            padding: '20px',
            height: 'fit-content'
          }}>
            {/* Tabs */}
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid #F2F2F2',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '10px 20px',
                borderBottom: '2px solid #7765DA',
                color: '#7765DA',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Participants
              </div>
            </div>

            {/* Student List */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#6E6E6E',
                fontSize: '14px',
                marginBottom: '15px',
                fontWeight: '500'
              }}>
                <span>Name</span>
                <span>Action</span>
              </div>

              {students.map((student, index) => (
                <div key={student.id || index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #f8f8f8'
                }}>
                  <span style={{ color: '#373737' }}>
                    {student.name}
                  </span>
                  <span style={{
                    color: student.hasAnswered ? '#28a745' : '#6E6E6E',
                    fontSize: '12px'
                  }}>
                    {student.hasAnswered ? 'Answered' : 'Waiting...'}
                  </span>
                </div>
              ))}

              {students.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: '#6E6E6E',
                  padding: '20px 0'
                }}>
                  No students connected
                </div>
              )}
            </div>

            {/* Summary */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#373737', fontWeight: '500' }}>
                {students.filter(s => s.hasAnswered).length}/{students.length} answered
              </div>
              <div style={{ color: '#6E6E6E', fontSize: '14px' }}>
                Total responses: {results.totalAnswers || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherResultsPage;