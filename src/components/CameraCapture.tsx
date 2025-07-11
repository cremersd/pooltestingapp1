import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, RotateCcw, Check, AlertTriangle, Loader, Info } from 'lucide-react';
import { PoolData, TestReading, ChemicalRecommendation, AIAnalysisResult } from '../types';
import { analyzeTestStrip, getDetailedRecommendations } from '../services/openai';
import { calculateRecommendations } from '../services/chemicals';

interface CameraCaptureProps {
  poolData: PoolData;
  onTestComplete: (results: TestReading, recommendations: ChemicalRecommendation[], aiAnalysis: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  poolData,
  onTestComplete,
  isAnalyzing,
  setIsAnalyzing
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions or use file upload.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      setAnalysisStep('Analyzing test strip image...');
      
      // Run analysis with consistency validation
      let aiResult: AIAnalysisResult;
      try {
        aiResult = await analyzeTestStrip(image);
      } catch (consistencyError) {
        setError(consistencyError.message);
        return;
      }
      
      setAnalysisStep('Calculating chemical recommendations...');
      const recommendations = calculateRecommendations(aiResult.readings, poolData);
      
      setAnalysisStep('Generating detailed analysis...');
      const detailedAnalysis = await getDetailedRecommendations(aiResult.readings, poolData);
      
      onTestComplete(aiResult.readings, recommendations, detailedAnalysis, aiResult.visualDebugging, aiResult.stripIdentification);
    } catch (err) {
      if (err.message && err.message.includes('Inconsistent readings')) {
        setError(err.message);
      } else {
        setError('Failed to analyze test strip. Please ensure the image is clear, well-lit, and shows the entire test strip with color reference chart visible.');
      }
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  }, [image, poolData, onTestComplete, setIsAnalyzing]);

  const retakePhoto = useCallback(() => {
    setImage(null);
    setError('');
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Strip Analysis</h2>
          <p className="text-gray-600">AI-powered analysis for all test strip types</p>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 text-blue-500 animate-spin" />
              <div>
                <p className="text-blue-700 font-medium">Processing...</p>
                <p className="text-blue-600 text-sm">{analysisStep}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-4 p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-cyan-500 mt-0.5" />
            <div>
              <p className="text-cyan-700 text-sm font-medium">For accurate results:</p>
              <p className="text-cyan-600 text-xs">
                Include color reference chart in photo • Use good lighting • Keep strip level
                {!import.meta.env.VITE_OPENAI_API_KEY && (
                  <span className="block mt-1 text-orange-600 font-medium">
                    ⚠️ Using demo mode - Add OpenAI API key for real analysis
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {!image && !cameraActive && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-dashed border-blue-300 rounded-xl p-8 text-center">
              <Camera className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-medium text-gray-800 mb-2">Capture Test Strip</h3>
              <p className="text-sm text-gray-600 mb-4">
                Include the color reference chart and ensure good lighting
              </p>
              <button
                onClick={startCamera}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera</span>
              </button>
            </div>
            
            <div className="text-center">
              <span className="text-gray-500 text-sm">or</span>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Image</span>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {cameraActive && (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 border-2 border-white/30 rounded-xl pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-white/60 rounded-lg"></div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-yellow-700 text-xs">
                <strong>Important:</strong> Make sure both the test strip AND the color reference chart (usually on the bottle) are clearly visible in the frame.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={stopCamera}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={captureImage}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
              >
                Capture
              </button>
            </div>
          </div>
        )}

        {image && (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden">
              <img src={image} alt="Test strip" className="w-full h-64 object-cover" />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={retakePhoto}
                disabled={isAnalyzing}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake</span>
              </button>
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraCapture;