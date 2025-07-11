import React, { useState } from 'react';
import { Camera, Upload, Beaker, Settings, History } from 'lucide-react';
import Header from './components/Header';
import PoolSetup from './components/PoolSetup';
import CameraCapture from './components/CameraCapture';
import TestResults from './components/TestResults';
import Navigation from './components/Navigation';
import { PoolData, TestReading, ChemicalRecommendation } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState<'setup' | 'capture' | 'results'>('setup');
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [testResults, setTestResults] = useState<TestReading | null>(null);
  const [recommendations, setRecommendations] = useState<ChemicalRecommendation[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visualDebugging, setVisualDebugging] = useState<any>(null);
  const [stripIdentification, setStripIdentification] = useState<any>(null);

  const handlePoolSetup = (data: PoolData) => {
    setPoolData(data);
    setCurrentStep('capture');
  };

  const handleTestComplete = (
    results: TestReading, 
    recommendations: ChemicalRecommendation[], 
    aiAnalysis: string,
    visualDebugging?: any,
    stripIdentification?: any
  ) => {
    setTestResults(results);
    setRecommendations(recommendations);
    setAiAnalysis(aiAnalysis);
    setVisualDebugging(visualDebugging);
    setStripIdentification(stripIdentification);
    setCurrentStep('results');
  };

  const handleStartOver = () => {
    setCurrentStep('setup');
    setTestResults(null);
    setRecommendations([]);
    setAiAnalysis('');
    setVisualDebugging(null);
    setStripIdentification(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <Header />
      
      <main className="pb-20">
        {currentStep === 'setup' && (
          <PoolSetup onComplete={handlePoolSetup} />
        )}
        
        {currentStep === 'capture' && poolData && (
          <CameraCapture 
            poolData={poolData}
            onTestComplete={handleTestComplete}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        )}
        
        {currentStep === 'results' && testResults && (
          <TestResults 
            results={testResults}
            recommendations={recommendations}
            poolData={poolData!}
            aiAnalysis={aiAnalysis}
            visualDebugging={visualDebugging}
            stripIdentification={stripIdentification}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      <Navigation currentStep={currentStep} onStepChange={setCurrentStep} />
    </div>
  );
}

export default App;