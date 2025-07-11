export interface PoolData {
  volume: number;
  type: 'chlorine' | 'saltwater' | 'bromine';
  location: 'indoor' | 'outdoor';
}

export interface TestReading {
  freeChlorine?: number;
  totalChlorine?: number;
  pH?: number;
  totalAlkalinity?: number;
  calciumHardness?: number;
  cyanuricAcid?: number;
  bromine?: number;
  nitrates?: number;
  phosphates?: number;
  timestamp: Date;
  confidence: number;
  stripType: string;
  detectedParameters: string[];
  analysisNotes?: string;
}

export interface ChemicalRecommendation {
  chemical: string;
  action: 'increase' | 'decrease' | 'maintain';
  amount: number;
  unit: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  instructions: string;
  cost?: number;
  timeToEffect?: string;
  safetyNotes?: string;
  alternativeOptions?: string[];
}

export interface ChemicalTarget {
  min: number;
  max: number;
  ideal: number;
  unit: string;
}

export interface ChemicalTargets {
  freeChlorine: ChemicalTarget;
  pH: ChemicalTarget;
  totalAlkalinity: ChemicalTarget;
  calciumHardness: ChemicalTarget;
  cyanuricAcid: ChemicalTarget;
  bromine: ChemicalTarget;
  nitrates?: ChemicalTarget;
  phosphates?: ChemicalTarget;
}

export interface AIAnalysisResult {
  readings: TestReading;
  stripAnalysis: {
    brandDetected?: string;
    parametersFound: string[];
    imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  };
  confidence: number;
  visualDebugging?: {
    padsVisible: number;
    padArrangement: string;
    padDescriptions: Array<{
      position: string;
      observedColor: string;
      identifiedParameter: string;
      confidence: string;
    }>;
    referenceChartVisible: boolean;
  };
  stripIdentification?: {
    stripType: string;
    identificationConfidence: number;
    brandDetected?: string;
  };
}