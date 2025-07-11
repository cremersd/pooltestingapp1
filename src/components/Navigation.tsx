import React from 'react';
import { Settings, History, Camera, Beaker } from 'lucide-react';

interface NavigationProps {
  currentStep: string;
  onStepChange: (step: 'setup' | 'capture' | 'results') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentStep, onStepChange }) => {
  const navItems = [
    { id: 'setup', label: 'Setup', icon: Settings },
    { id: 'capture', label: 'Test', icon: Camera },
    { id: 'results', label: 'Results', icon: Beaker },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-white/20">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.id;
            const isDisabled = item.id === 'history';
            
            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && onStepChange(item.id as any)}
                disabled={isDisabled}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : isDisabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;