import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import IntroScreen from './components/screens/IntroScreen';
import UploadScreen from './components/screens/UploadScreen';
import ObjectivesScreen from './components/screens/ObjectivesScreen';
import ParametersScreen from './components/screens/ParametersScreen';
import ResultsScreen from './components/screens/ResultsScreen';
import { AssessmentProvider } from './context/AssessmentContext';

function App() {
  return (
    <AssessmentProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<IntroScreen />} />
              <Route path="/upload" element={<UploadScreen />} />
              <Route path="/objectives" element={<ObjectivesScreen />} />
              <Route path="/parameters" element={<ParametersScreen />} />
              <Route path="/results" element={<ResultsScreen />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AssessmentProvider>
  );
}

export default App;