const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
app.use(express.json());

// Store connected users
let students = [];
let teachers = [];
let currentQuestion = null;

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Live Polling System Backend' });
});

// Socket connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle student joining
  socket.on('join-as-student', (data) => {
    // Remove any existing student with same name (in case of reconnection)
    students = students.filter(s => s.name !== data.name);
    
    const student = {
      id: socket.id,
      name: data.name,
      hasAnswered: false
    };
    students.push(student);
    console.log(`Student ${data.name} joined. Total students: ${students.length}`);
    
    // Send updated student list to teachers
    io.emit('students-updated', students);
    
    // Send current question if exists (for late joiners)
    if (currentQuestion) {
      console.log(`Sending existing question to ${data.name}`);
      socket.emit('new-question', currentQuestion);
    }
  });
  
  // Handle teacher joining
  socket.on('join-as-teacher', () => {
    // Remove any existing teacher with same socket (in case of reconnection)
    teachers = teachers.filter(t => t.id !== socket.id);
    
    const teacher = {
      id: socket.id
    };
    teachers.push(teacher);
    console.log(`Teacher joined. Total teachers: ${teachers.length}`);
    
    // Send current student list to new teacher
    socket.emit('students-updated', students);
    
    // Send current results if exists
    if (currentQuestion && currentQuestion.answers.length > 0) {
      const results = calculateResults(currentQuestion);
      socket.emit('results-updated', {
        results: results,
        students: students
      });
    }
  });
  
  // Handle teacher asking question
  socket.on('ask-question', (questionData) => {
    console.log('=== TEACHER ASKED QUESTION ===');
    console.log('Question:', questionData.question);
    console.log('Options:', questionData.options);
    console.log('Timer:', questionData.timer);
    
    currentQuestion = {
      ...questionData,
      id: Date.now(),
      startTime: Date.now(),
      answers: []
    };
    
    // Reset all students' answered status
    students.forEach(student => {
      student.hasAnswered = false;
    });
    
    console.log('=== BROADCASTING TO STUDENTS ===');
    console.log('Connected students:', students.length);
    
    // Broadcast question to all students
    io.emit('new-question', currentQuestion);
    
    // Send updated student list to teachers
    io.emit('students-updated', students);
    
    console.log('Question broadcasted to all clients');
  });
  
  // Handle student answer submission
  socket.on('submit-answer', (answerData) => {
    console.log(`Answer from ${answerData.studentName}:`, answerData);
    
    if (currentQuestion) {
      // Find the student and mark as answered
      const student = students.find(s => s.name === answerData.studentName);
      if (student) {
        student.hasAnswered = true;
      }
      
      // Add answer to current question
      currentQuestion.answers.push({
        studentName: answerData.studentName,
        selectedOption: answerData.selectedOption,
        isTimeout: answerData.isTimeout,
        timestamp: Date.now()
      });
      
      console.log(`Total answers: ${currentQuestion.answers.length}/${students.length}`);
      
      // Calculate and send updated results to teachers
      const results = calculateResults(currentQuestion);
      io.emit('results-updated', {
        results: results,
        students: students
      });
      
      // Check if all students have answered or time is up
      const allAnswered = students.every(student => student.hasAnswered);
      const timeElapsed = Date.now() - currentQuestion.startTime;
      const timeUp = timeElapsed >= (currentQuestion.timer * 1000);
      
      if (allAnswered || timeUp) {
        // Send final results to all users
        io.emit('show-results', results);
        console.log('Final results sent to all users');
      }
    }
  });
  
  // Handle clearing poll (for new questions)
  socket.on('clear-poll', () => {
    console.log('Clearing current poll');
    currentQuestion = null;
    students.forEach(student => {
      student.hasAnswered = false;
    });
    io.emit('students-updated', students);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from students or teachers
    const wasStudent = students.some(student => student.id === socket.id);
    const wasTeacher = teachers.some(teacher => teacher.id === socket.id);
    
    students = students.filter(student => student.id !== socket.id);
    teachers = teachers.filter(teacher => teacher.id !== socket.id);
    
    console.log(`Remaining - Students: ${students.length}, Teachers: ${teachers.length}`);
    
    // Update student list if a student disconnected
    if (wasStudent) {
      io.emit('students-updated', students);
    }
  });
});

// Calculate results function
function calculateResults(question) {
  const totalAnswers = question.answers.length;
  const optionCounts = {};
  
  // Initialize counts
  question.options.forEach(option => {
    optionCounts[option.id] = 0;
  });
  
  // Count answers
  question.answers.forEach(answer => {
    if (answer.selectedOption && optionCounts[answer.selectedOption] !== undefined) {
      optionCounts[answer.selectedOption]++;
    }
  });
  
  // Calculate percentages
  const results = question.options.map(option => ({
    ...option,
    count: optionCounts[option.id],
    percentage: totalAnswers > 0 ? Math.round((optionCounts[option.id] / totalAnswers) * 100) : 0
  }));
  
  return {
    question: question.question,
    totalAnswers,
    results
  };
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});