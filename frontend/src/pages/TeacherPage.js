import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const TeacherPage = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { id: 1, text: '', isCorrect: true },
    { id: 2, text: '', isCorrect: false }
  ]);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate(); // Inside component
  const [socket, setSocket] = useState(null); // Inside component

  // useEffect inside component
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join as teacher
    newSocket.emit('join-as-teacher');

    return () => {
      newSocket.close();
    };
  }, []);

  const addOption = () => {
    const newOption = {
      id: options.length + 1,
      text: '',
      isCorrect: false
    };
    setOptions([...options, newOption]);
  };

  const updateOption = (id, text) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, text } : option
    ));
  };

  const updateCorrect = (id, isCorrect) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, isCorrect } : option
    ));
  };

  const handleAskQuestion = () => {
  if (question.trim() && options.some(opt => opt.text.trim()) && socket) {
    const questionData = {
      question: question.trim(),
      options: options.filter(opt => opt.text.trim()).map((opt, index) => ({
        id: index + 1,
        text: opt.text,
        isCorrect: opt.isCorrect
      })),
      timer
    };
    
    console.log('Question to be asked:', questionData);
    
    // Emit question to all students
    socket.emit('ask-question', questionData);
    
    // Store question for results page
    localStorage.setItem('currentPollResults', JSON.stringify({
      question: questionData.question,
      results: questionData.options.map(opt => ({...opt, count: 0, percentage: 0})),
      totalAnswers: 0
    }));
    
    // Navigate to results page
    navigate('/teacher/results');
  }
};

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header Badge */}
      <div style={{ 
        backgroundColor: '#7765DA', 
        color: 'white', 
        padding: '8px 16px', 
        borderRadius: '20px', 
        display: 'inline-block',
        marginBottom: '20px'
      }}>
        📊 Intervue Poll
      </div>
      
      {/* Title */}
      <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#373737' }}>
        Let's Get Started
      </h1>
      
      {/* Description */}
      <p style={{ 
        color: '#6E6E6E', 
        fontSize: '16px', 
        marginBottom: '30px',
        lineHeight: '1.5'
      }}>
        you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
      </p>
      
      {/* Question Input Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ color: '#373737', fontWeight: '500' }}>
            Enter your question
          </label>
          <select 
            value={timer}
            onChange={(e) => setTimer(Number(e.target.value))}
            style={{
              padding: '5px 10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              backgroundColor: 'white'
            }}
          >
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={90}>90 seconds</option>
            <option value={120}>120 seconds</option>
          </select>
        </div>
        
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question here..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '15px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#F2F2F2',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
        <div style={{ textAlign: 'right', color: '#6E6E6E', fontSize: '14px', marginTop: '5px' }}>
          {question.length}/100
        </div>
      </div>

      {/* Options Section */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '50px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#373737', marginBottom: '15px' }}>Edit Options</h3>
            {options.map((option, index) => (
              <div key={option.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <div style={{
                  backgroundColor: '#7765DA',
                  color: 'white',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  fontSize: '14px'
                }}>
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  placeholder="Enter option text"
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    backgroundColor: '#F2F2F2'
                  }}
                />
              </div>
            ))}
            
            <button
              onClick={addOption}
              style={{
                color: '#7765DA',
                backgroundColor: 'transparent',
                border: '1px solid #7765DA',
                padding: '8px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              + Add More option
            </button>
          </div>
          
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#373737', marginBottom: '15px' }}>Is it Correct?</h3>
            {options.map((option, index) => (
              <div key={option.id} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={`correct-${option.id}`}
                      checked={option.isCorrect}
                      onChange={() => updateCorrect(option.id, true)}
                      style={{ marginRight: '5px' }}
                    />
                    Yes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={`correct-${option.id}`}
                      checked={!option.isCorrect}
                      onChange={() => updateCorrect(option.id, false)}
                      style={{ marginRight: '5px' }}
                    />
                    No
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ask Question Button */}
      <div style={{ textAlign: 'right' }}>
        <button 
          onClick={handleAskQuestion}
          disabled={!question.trim() || !options.some(opt => opt.text.trim())}
          style={{
            backgroundColor: (question.trim() && options.some(opt => opt.text.trim())) ? '#7765DA' : '#ccc',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '25px',
            cursor: (question.trim() && options.some(opt => opt.text.trim())) ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Ask Question
        </button>
      </div>
    </div>
  );
};

export default TeacherPage;