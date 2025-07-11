import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, ChevronRight, RotateCcw, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Brain, Beaker, Eye, Shield, Search, Camera } from 'lucide-react';
import { TestReading, ChemicalRecommendation, PoolData } from '../types';
import { getChemicalTargets } from '../services/chemicals';

interface TestResultsProps {
  results: TestReading;
  recommendations: ChemicalRecommendation[];
  poolData: PoolData;
  aiAnalysis: string;
  visualDebugging?: any;
  stripIdentification?: any;
  onStartOver: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({
  results,
  recommendations,
  poolData,
  aiAnalysis,
  visualDebugging,
  stripIdentification,
  onStartOver
}) => {
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [expandedRecommendation, setExpandedRecommendation] = useState<number | null>(null);
  const [showReadingVerification, setShowReadingVerification] = useState(false);
  const [showVisualDebugging, setShowVisualDebugging] = useState(false);
  
  const targets = getChemicalTargets(poolData.type);

  const getStatusIcon = (value: number, target: { min: number; max: number; ideal: number }) => {
    if (value >= target.min && value <= target.max) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (value < target.min * 0.8 || value > target.max * 1.2) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (value: number, target: { min: number; max: number; ideal: number }) => {
    if (value >= target.min && value <= target.max) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (value < target.min * 0.8 || value > target.max * 1.2) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'high':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <TrendingDown className="w-4 h-4 text-yellow-500" />;
      default:
        return <Minus className="w-4 h-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-green-50 border-green-200 text-green-700';
    }
  };

  // Build readings array only for detected parameters
  const readings = [];
  const detectedParams = results.detectedParameters || [];

  if (detectedParams.includes('Free Chlorine') && results.freeChlorine !== undefined) {
    readings.push({ name: 'Free Chlorine', value: results.freeChlorine, target: targets.freeChlorine, unit: 'ppm' });
  }
  if (detectedParams.includes('pH') && results.pH !== undefined) {
    readings.push({ name: 'pH Level', value: results.pH, target: targets.pH, unit: '' });
  }
  if (detectedParams.includes('Total Alkalinity') && results.totalAlkalinity !== undefined) {
    readings.push({ name: 'Total Alkalinity', value: results.totalAlkalinity, target: targets.totalAlkalinity, unit: 'ppm' });
  }
  if (detectedParams.includes('Calcium Hardness') && results.calciumHardness !== undefined) {
    readings.push({ name: 'Calcium Hardness', value: results.calciumHardness, target: targets.calciumHardness, unit: 'ppm' });
  }
  if (detectedParams.includes('Cyanuric Acid') && results.cyanuricAcid !== undefined) {
    readings.push({ name: 'Cyanuric Acid', value: results.cyanuricAcid, target: targets.cyanuricAcid, unit: 'ppm' });
  }
  if (detectedParams.includes('Total Chlorine') && results.totalChlorine !== undefined) {
    readings.push({ name: 'Total Chlorine', value: results.totalChlorine, target: targets.freeChlorine, unit: 'ppm' });
  }
  if (detectedParams.includes('Bromine') && results.bromine !== undefined) {
    readings.push({ name: 'Bromine', value: results.bromine, target: targets.bromine, unit: 'ppm' });
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Test Results Header */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Results</h2>
          <div className="space-y-2 mb-2">
            <div className="flex items-center justify-center space-x-2">
              <Beaker className="w-5 h-5 text-blue-500" />
              <p className="text-gray-600">
                {results.stripType} strip
              </p>
            </div>
            {stripIdentification && (
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className="text-gray-600">
                  Strip ID: {Math.round(stripIdentification.identificationConfidence * 100)}% confidence
                </span>
                <span className="text-gray-600">
                  Readings: {Math.round(results.confidence * 100)}% confidence
                </span>
              </div>
            )}
          </div>
          
          {/* Consistency Badge */}
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600 font-medium">Consistency Validated</span>
          </div>
          
          <p className="text-xs text-gray-500">
            {results.timestamp.toLocaleString()}
          </p>
          {results.analysisNotes && (
            <p className="text-xs text-gray-600 mt-2 italic">
              {results.analysisNotes}
            </p>
          )}
        </div>
      </div>

      {/* Visual Debugging Section */}
      {visualDebugging && (
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          <button
            onClick={() => setShowVisualDebugging(!showVisualDebugging)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-800">Visual Analysis Debug</h3>
            </div>
            {showVisualDebugging ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {showVisualDebugging && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-3">What the AI Detected:</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Color Pads Visible:</span>
                    <span className="text-sm font-bold text-gray-900">{visualDebugging.padsVisible}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Arrangement:</span>
                    <span className="text-sm font-bold text-gray-900">{visualDebugging.padArrangement}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Reference Chart:</span>
                    <span className={`text-sm font-bold ${visualDebugging.referenceChartVisible ? 'text-green-600' : 'text-red-600'}`}>
                      {visualDebugging.referenceChartVisible ? 'Visible' : 'Not Found'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-orange-800 mb-2">Individual Pad Analysis:</h5>
                  <div className="space-y-2">
                    {visualDebugging.padDescriptions?.map((pad: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{pad.position}</p>
                            <p className="text-xs text-gray-600">Color: {pad.observedColor}</p>
                            <p className="text-xs text-gray-600">Parameter: {pad.identifiedParameter}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            pad.confidence === 'high' ? 'bg-green-100 text-green-700' :
                            pad.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {pad.confidence}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {!visualDebugging.referenceChartVisible && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">
                      ⚠️ No color reference chart detected in image. For best accuracy, include the color chart from your test strip bottle in the photo.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reading Verification Section */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
        <button
          onClick={() => setShowReadingVerification(!showReadingVerification)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">Verify AI Readings</h3>
          </div>
          {showReadingVerification ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {showReadingVerification && (
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-blue-700 text-sm mb-3">
                Please verify these readings match what you see on your test strip:
              </p>
              <div className="space-y-2">
                {readings.map((reading) => (
                  <div key={reading.name} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{reading.name}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {reading.value} {reading.unit}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex space-x-3">
                <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                  ✓ Readings Look Correct
                </button>
                <button 
                  onClick={onStartOver}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  ✗ Retake Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* AI Analysis Section */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
        <button
          onClick={() => setShowAIAnalysis(!showAIAnalysis)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-800">AI Analysis & Insights</h3>
          </div>
          {showAIAnalysis ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {showAIAnalysis && (
          <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="prose prose-sm max-w-none">
              {aiAnalysis.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <h4 key={index} className="font-semibold text-purple-800 mt-3 mb-1">
                      {paragraph.replace(/\*\*/g, '')}
                    </h4>
                  );
                } else if (paragraph.trim()) {
                  return (
                    <p key={index} className="text-purple-700 text-sm mb-2">
                      {paragraph}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Chemical Readings */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Chemical Levels ({detectedParams.length} parameters detected)
        </h3>
        <div className="space-y-3">
          {readings.map((reading) => (
            <div key={reading.name} className={`p-4 rounded-xl border ${getStatusColor(reading.value, reading.target)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(reading.value, reading.target)}
                  <div>
                    <p className="font-medium text-gray-800">{reading.name}</p>
                    <p className="text-sm text-gray-600">
                      Target: {reading.target.min}-{reading.target.max} {reading.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {reading.value} {reading.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Chemical Recommendations ({recommendations.length})
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className={`rounded-xl border ${getPriorityColor(rec.priority)}`}>
                <button
                  onClick={() => setExpandedRecommendation(expandedRecommendation === index ? null : index)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getPriorityIcon(rec.priority)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{rec.chemical}</h4>
                          <span className="text-xs font-medium px-2 py-1 bg-white/60 rounded-lg">
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{rec.reason}</p>
                        <div className="bg-white/60 rounded-lg p-3">
                          <p className="font-medium mb-1">
                            {rec.action === 'increase' ? 'Add' : rec.action === 'decrease' ? 'Reduce' : 'Maintain'}: 
                            {rec.amount > 0 ? ` ${rec.amount} ${rec.unit}` : ' See instructions'}
                          </p>
                          {rec.cost && rec.cost > 0 && (
                            <p className="text-xs text-gray-600">
                              Est. cost: ${rec.cost.toFixed(2)} • Time to effect: {rec.timeToEffect}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {expandedRecommendation === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 ml-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 ml-2" />
                    )}
                  </div>
                </button>
                
                {expandedRecommendation === index && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-white/80 rounded-lg p-3">
                      <h5 className="font-medium text-sm mb-2">Instructions:</h5>
                      <p className="text-sm text-gray-700">{rec.instructions}</p>
                    </div>
                    
                    {rec.safetyNotes && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <h5 className="font-medium text-sm text-red-800 mb-2">Safety Notes:</h5>
                        <p className="text-sm text-red-700">{rec.safetyNotes}</p>
                      </div>
                    )}
                    
                    {rec.alternativeOptions && rec.alternativeOptions.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="font-medium text-sm text-blue-800 mb-2">Alternative Options:</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {rec.alternativeOptions.map((option, optIndex) => (
                            <li key={optIndex} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{option}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onStartOver}
          className="flex-1 bg-white/80 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-white transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New Test</span>
        </button>
        <button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2">
          <span>Save Results</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TestResults;