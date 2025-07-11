import React, { useState } from 'react';
import { ChevronRight, School as Pool, Waves, Home, Sun } from 'lucide-react';
import { PoolData } from '../types';

interface PoolSetupProps {
  onComplete: (data: PoolData) => void;
}

const PoolSetup: React.FC<PoolSetupProps> = ({ onComplete }) => {
  const [volume, setVolume] = useState<string>('');
  const [type, setType] = useState<'chlorine' | 'saltwater' | 'bromine'>('chlorine');
  const [location, setLocation] = useState<'indoor' | 'outdoor'>('outdoor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (volume && parseFloat(volume) > 0) {
      onComplete({
        volume: parseFloat(volume),
        type,
        location
      });
    }
  };

  const poolTypes = [
    { value: 'chlorine', label: 'Chlorine Pool', icon: Pool, color: 'from-blue-500 to-cyan-500' },
    { value: 'saltwater', label: 'Saltwater Pool', icon: Waves, color: 'from-teal-500 to-cyan-500' },
    { value: 'bromine', label: 'Bromine Pool', icon: Pool, color: 'from-purple-500 to-blue-500' }
  ];

  const locations = [
    { value: 'outdoor', label: 'Outdoor', icon: Sun },
    { value: 'indoor', label: 'Indoor', icon: Home }
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pool Setup</h2>
          <p className="text-gray-600">Tell us about your pool for accurate chemical calculations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pool Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pool Volume (gallons)
            </label>
            <div className="relative">
              <input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="Enter pool volume"
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                min="100"
                max="100000"
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <Pool className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Typical residential pools: 15,000-25,000 gallons
            </p>
          </div>

          {/* Pool Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pool Type
            </label>
            <div className="grid grid-cols-1 gap-3">
              {poolTypes.map((poolType) => {
                const Icon = poolType.icon;
                return (
                  <button
                    key={poolType.value}
                    type="button"
                    onClick={() => setType(poolType.value as any)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      type === poolType.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white/60 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${poolType.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-800">{poolType.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pool Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pool Location
            </label>
            <div className="grid grid-cols-2 gap-3">
              {locations.map((loc) => {
                const Icon = loc.icon;
                return (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => setLocation(loc.value as any)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      location === loc.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white/60 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">{loc.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!volume || parseFloat(volume) <= 0}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>Continue to Testing</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PoolSetup;