import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import UploadPDF from './pages/UploadPDF';
import Analysis from './pages/Analysis';
import RiskScoring from './pages/RiskScoring';
import AuditReport from './pages/AuditReport';
import EvidenceValidation from './pages/EvidenceValidation';
import Chatbot from './pages/Chatbot';
import Documents from './pages/documents.jsx';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
  path="/documents"
  element={
    <ProtectedRoute>
      <Documents />
    </ProtectedRoute>
  }
/>

       <Route
    path="/upload"
    element={
      <ProtectedRoute>
        <UploadPDF />
      </ProtectedRoute>
    }
  />

  <Route
    path="/analysis"
    element={
      <ProtectedRoute>
        <Analysis />
      </ProtectedRoute>
    }
  />

  <Route
    path="/analysis/:id"
    element={
      <ProtectedRoute>
        <Analysis />
      </ProtectedRoute>
    }
  />

  <Route
    path="/risk"
    element={
      <ProtectedRoute>
        <RiskScoring />
      </ProtectedRoute>
    }
  />

  <Route
    path="/audit"
    element={
      <ProtectedRoute>
        <AuditReport />
      </ProtectedRoute>
    }
  />

  <Route
    path="/evidence"
    element={
      <ProtectedRoute>
        <EvidenceValidation />
      </ProtectedRoute>
    }
  />

  <Route
    path="/chatbot"
    element={
      <ProtectedRoute>
        <Chatbot />
      </ProtectedRoute>
    }
  />
  
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
