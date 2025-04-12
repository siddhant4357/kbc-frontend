import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import QuestionBank from './Pages/QuestionBank';
import CreateQuestionBank from './Pages/CreateQuestionBank';
import EditQuestionBank from './Pages/EditQuestionBank';
import ManageUsers from './Pages/ManageUsers';
import PlayGame from './Pages/PlayGame';
import ManagePlayAlong from './Pages/ManagePlayAlong';
import Leaderboard from './Pages/LeaderBoard';
import PlayAlong from './Pages/PlayAlong'; // Fix the casing here
import JoinGame from './Pages/JoinGame';
import JoinQuestions from './Pages/JoinQuestions';
import GameRules from './Pages/GameRules';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/play-along" element={
              <ProtectedRoute>
                <PlayAlong />
              </ProtectedRoute>
            } />
            
            <Route path="/play-game/:id" element={
              <ProtectedRoute>
                <PlayGame />
              </ProtectedRoute>
            } />

            <Route path="/join-game" element={
              <ProtectedRoute>
                <JoinGame />
              </ProtectedRoute>
            } />

            <Route path="/join-questions/:id" element={
              <ProtectedRoute>
                <JoinQuestions />
              </ProtectedRoute>
            } />

            <Route path="/game-rules/:bankId" element={
              <ProtectedRoute>
                <GameRules />
              </ProtectedRoute>
            } />

            {/* Admin Only Routes */}
            <Route path="/question-bank" element={
              <AdminRoute>
                <QuestionBank />
              </AdminRoute>
            } />
            
            <Route path="/create-question-bank" element={
              <AdminRoute>
                <CreateQuestionBank />
              </AdminRoute>
            } />
            
            <Route path="/edit-question-bank/:id" element={
              <AdminRoute>
                <EditQuestionBank />
              </AdminRoute>
            } />
            
            <Route path="/manage-users" element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            } />
            
            <Route path="/manage-play-along" element={
              <AdminRoute>
                <ManagePlayAlong />
              </AdminRoute>
            } />
            
            <Route path="/leaderboard" element={
              <AdminRoute>
                <Leaderboard />
              </AdminRoute>
            } />
          </Routes>
        </React.Suspense>
      </Router>
    </ErrorBoundary>
  );
};

export default App;