import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Droplets, Timer, Moon, Footprints, LogIn, Sparkles, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from './LoadingSpinner';

const moodEmojis: Record<string, string> = {
  happy: '😊', neutral: '😐', tired: '😴', stressed: '😓', energetic: '💪',
};

const recommendedTargets = {
  waterIntake: 8, exercise: 30, sleepHours: 8, steps: 10000,
};

function getProgressPercentage(value: string, max: number): number {
  const num = Number(value);
  if (isNaN(num) || max <= 0) return 0;
  return Math.min(Math.round((num / max) * 100), 100);
}

function getProgressColor(pct: number): string {
  if (pct >= 80) return 'bg-success';
  if (pct >= 50) return 'bg-teal';
  if (pct >= 25) return 'bg-yellow-400';
  return 'bg-error';
}

export default function DashboardScreen() {
  const {
    personalDetails, healthLogs,
    setCurrentScreen, logout,
    isLoading, apiError, refreshFromApi,
  } = useApp();

  // refresh data every time dashboard mounts
  useEffect(() => { refreshFromApi(); }, [refreshFromApi]);

  const latestLog = healthLogs[healthLogs.length - 1];
  const firstName = personalDetails?.fullName?.split(' ')[0] || 'there';

  const metrics = latestLog ? [
    {
      icon: <Droplets className="w-5 h-5 text-teal" />,
      label: 'Water Intake',
      value: `${latestLog.waterIntake} glasses`,
      target: `${recommendedTargets.waterIntake} glasses`,
      progress: getProgressPercentage(latestLog.waterIntake, recommendedTargets.waterIntake),
    },
    {
      icon: <Timer className="w-5 h-5 text-teal" />,
      label: 'Exercise',
      value: `${latestLog.exercise} min`,
      target: `${recommendedTargets.exercise} min`,
      progress: getProgressPercentage(latestLog.exercise, recommendedTargets.exercise),
    },
    {
      icon: <Moon className="w-5 h-5 text-teal" />,
      label: 'Sleep',
      value: `${latestLog.sleepHours} hrs`,
      target: `${recommendedTargets.sleepHours} hrs`,
      progress: getProgressPercentage(latestLog.sleepHours, recommendedTargets.sleepHours),
    },
    {
      icon: <Footprints className="w-5 h-5 text-teal" />,
      label: 'Steps',
      value: Number(latestLog.steps).toLocaleString(),
      target: `${recommendedTargets.steps.toLocaleString()} steps`,
      progress: getProgressPercentage(latestLog.steps, recommendedTargets.steps),
    },
  ] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-glow-teal">
            <Activity className="w-8 h-8 text-navy" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, {firstName}!
          </h1>
          <p className="text-text-secondary flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-teal" />
            Here's your health summary
            <Sparkles className="w-4 h-4 text-teal" />
          </p>
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center mb-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* API error */}
        {apiError && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-4 mb-6 border border-error/40 text-error text-sm text-center"
          >
            {apiError}
          </motion.div>
        )}

        {/* Stats */}
        {!isLoading && latestLog && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {metric.icon}
                    <span className="text-text-secondary text-xs font-medium">{metric.label}</span>
                  </div>
                  <p className="text-white text-xl font-bold mb-1">{metric.value}</p>
                  <div className="w-full bg-navy/60 rounded-full h-2 mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.progress}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className={`h-2 rounded-full ${getProgressColor(metric.progress)}`}
                    />
                  </div>
                  <p className="text-text-secondary text-xs">
                    {metric.progress >= 100 ? 'Goal reached! 🎉' : `${metric.progress}% of ${metric.target}`}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Mood + Calories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="glass-card p-4 mb-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{moodEmojis[latestLog.mood] || '😊'}</span>
                <div>
                  <p className="text-text-secondary text-xs">Current Mood</p>
                  <p className="text-white font-medium capitalize">{latestLog.mood}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-text-secondary text-xs">Calories</p>
                <p className="text-white font-bold">
                  {latestLog.calories} <span className="text-text-secondary text-xs font-normal">kcal</span>
                </p>
              </div>
            </motion.div>
          </>
        )}

        {/* No data prompt */}
        {!isLoading && !latestLog && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-card p-8 mb-6 text-center"
          >
            <Activity className="w-12 h-12 text-teal mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">No Health Data Yet</h3>
            <p className="text-text-secondary text-sm">
              Start tracking by logging your first entry!
            </p>
          </motion.div>
        )}

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={() => setCurrentScreen('personal-details')}
            className="gradient-btn w-full text-lg flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Log Today's Health
          </button>

          <button
            onClick={logout}
            className="w-full py-3 px-8 rounded-xl border border-white/10 text-text-secondary
                       hover:border-error/50 hover:text-error transition-all duration-300
                       flex items-center justify-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
