import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentPage from './pages/StudentPage';
import StudentWaitingPage from './pages/StudentWaitingPage';
import StudentQuestionPage from './pages/StudentQuestionPage';
import StudentResultsPage from './pages/StudentResultsPage';
import TeacherPage from './pages/TeacherPage';
import TeacherResultsPage from './pages/TeacherResultsPage'; // ADD THIS LINE

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/student" element={<StudentPage />} />
          <Route path="/student/waiting" element={<StudentWaitingPage />} />
          <Route path="/student/question" element={<StudentQuestionPage />} />
          <Route path="/student/results" element={<StudentResultsPage />} />
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/teacher/results" element={<TeacherResultsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;