import { motion } from 'framer-motion';
import { Check, Droplets, Timer, Moon, Flame, Footprints, RefreshCw, User, Target, LayoutDashboard } from 'lucide-react';
import { useApp } from '../context/AppContext';

const moodEmojis: Record<string, string> = {
  happy: '😊', neutral: '😐', tired: '😴', stressed: '😓', energetic: '💪',
};

const motivationalMessages: Record<string, string> = {
  'Lose Weight':    "Every healthy choice brings you closer to your goal. You're building a stronger, healthier version of yourself! 🌟",
  'Build Muscle':   "Every rep, every step, every healthy meal is building the strong body you deserve. Keep pushing! 💪",
  'Stay Healthy':   "Consistency is key! By tracking your health daily, you're investing in a vibrant future. 🌿",
  'Improve Sleep':  "Great sleep is the foundation of great health. You're on the path to better rest and recovery! 😴✨",
};

export default function ConfirmationScreen() {
  const { personalDetails, healthLogs, setCurrentScreen } = useApp();
  const latestLog = healthLogs[healthLogs.length - 1];
  const goal      = personalDetails?.healthGoal || 'Stay Healthy';
  const message   = motivationalMessages[goal] || motivationalMessages['Stay Healthy'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow-teal">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
            >
              <Check className="w-12 h-12 text-navy" />
            </motion.div>
          </div>
        </motion.div>

        {/* Success text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold text-white mb-2">Entry Logged! 🎉</h2>
          <p className="text-text-secondary">
            Great job, {personalDetails?.fullName?.split(' ')[0] || 'there'}!
            <br />
            <span className="text-teal text-sm">Saved to your Supabase database ✓</span>
          </p>
        </motion.div>

        {/* Summary card */}
        {latestLog && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="glass-card p-6 mb-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-teal" />
              Today's Summary
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Droplets className="w-3 h-3 text-teal" />, label: 'Water',    value: `${latestLog.waterIntake} glasses` },
                { icon: <Timer className="w-3 h-3 text-teal" />,    label: 'Exercise', value: `${latestLog.exercise} min` },
                { icon: <Moon className="w-3 h-3 text-teal" />,     label: 'Sleep',    value: `${latestLog.sleepHours} hrs` },
                { icon: <span className="text-sm">{moodEmojis[latestLog.mood] || '😊'}</span>, label: 'Mood', value: latestLog.mood },
                { icon: <Flame className="w-3 h-3 text-teal" />,    label: 'Calories', value: `${latestLog.calories} kcal` },
                { icon: <Footprints className="w-3 h-3 text-teal" />, label: 'Steps',  value: Number(latestLog.steps).toLocaleString() },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-navy/40 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
                    {icon}{label}
                  </div>
                  <p className="text-white font-bold text-lg capitalize">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-navy/40 rounded-xl p-3 flex items-center gap-3">
              <User className="w-5 h-5 text-teal" />
              <div>
                <p className="text-text-secondary text-xs">Health Goal</p>
                <p className="text-white font-medium text-sm">{goal}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Motivational message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="glass-card p-5 mb-6"
        >
          <p className="text-text-secondary text-sm leading-relaxed text-center">{message}</p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="space-y-3"
        >
          <button onClick={() => setCurrentScreen('dashboard')}
            className="gradient-btn w-full text-lg flex items-center justify-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            View Dashboard
          </button>

          <button onClick={() => setCurrentScreen('daily-log')}
            className="w-full py-3 px-8 rounded-xl border border-white/10 text-text-secondary
                       hover:border-teal/50 hover:text-white transition-all duration-300
                       flex items-center justify-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            Log Another Day
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
