import { Screen } from '../types';

interface ProgressIndicatorProps {
  currentScreen: Screen;
}

const steps = [
  { screen: 'personal-details' as Screen, label: 'Personal Details', step: 1 },
  { screen: 'daily-log' as Screen, label: 'Daily Log', step: 2 },
  { screen: 'confirmation' as Screen, label: 'Confirmation', step: 3 },
];

export default function ProgressIndicator({ currentScreen }: ProgressIndicatorProps) {
  if (currentScreen === 'login' || currentScreen === 'dashboard') return null;

  const currentStep = steps.find(s => s.screen === currentScreen)?.step || 1;

  return (
    <div className="w-full max-w-md mx-auto mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-secondary text-sm font-medium">
          Step {currentStep} of 3
        </span>
        <span className="text-teal text-sm font-medium">
          {steps.find(s => s.screen === currentScreen)?.label}
        </span>
      </div>
      <div className="flex gap-2">
        {steps.map((step) => (
          <div
            key={step.screen}
            className={`flex-1 h-2 rounded-full transition-all duration-500 ${
              step.step <= currentStep
                ? 'bg-gradient-primary'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
