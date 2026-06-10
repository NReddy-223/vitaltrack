import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Timer, Moon, Flame, Footprints, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DailyHealthLog, Mood, MoodOption } from '../types';
import { apiSaveHealthLog } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const moodOptions: MoodOption[] = [
  { value: 'happy',    emoji: '😊', label: 'Happy' },
  { value: 'neutral',  emoji: '😐', label: 'Neutral' },
  { value: 'tired',    emoji: '😴', label: 'Tired' },
  { value: 'stressed', emoji: '😓', label: 'Stressed' },
  { value: 'energetic',emoji: '💪', label: 'Energetic' },
];

export default function DailyHealthLogScreen() {
  const { addHealthLog, setCurrentScreen, authToken, userId } = useApp();

  const [formData, setFormData] = useState<DailyHealthLog>({
    waterIntake: '', exercise: '', sleepHours: '', mood: '', calories: '', steps: '',
  });
  const [errors, setErrors]   = useState<Partial<DailyHealthLog>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Partial<DailyHealthLog> = {};
    if (!formData.waterIntake.trim()) e.waterIntake = 'Water intake is required';
    else if (Number(formData.waterIntake) < 1 || Number(formData.waterIntake) > 20)
      e.waterIntake = 'Must be between 1 and 20 glasses';
    if (!formData.exercise.trim()) e.exercise = 'Exercise is required';
    else if (Number(formData.exercise) < 0 || Number(formData.exercise) > 600)
      e.exercise = 'Must be between 0 and 600 minutes';
    if (!formData.sleepHours.trim()) e.sleepHours = 'Sleep hours is required';
    else if (Number(formData.sleepHours) < 0 || Number(formData.sleepHours) > 24)
      e.sleepHours = 'Must be between 0 and 24 hours';
    if (!formData.mood) e.mood = 'Please select your mood';
    if (!formData.calories.trim()) e.calories = 'Calories is required';
    else if (Number(formData.calories) < 0 || Number(formData.calories) > 10000)
      e.calories = 'Must be between 0 and 10000 kcal';
    if (!formData.steps.trim()) e.steps = 'Steps is required';
    else if (Number(formData.steps) < 0 || Number(formData.steps) > 100000)
      e.steps = 'Must be between 0 and 100000 steps';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      if (authToken && userId) {
        await apiSaveHealthLog(userId, {
          water_intake:     Number(formData.waterIntake),
          exercise_minutes: Number(formData.exercise),
          sleep_hours:      Number(formData.sleepHours),
          mood:             formData.mood,
          calories:         Number(formData.calories),
          steps:            Number(formData.steps),
        }, authToken);
      }
      // also update local context so ConfirmationScreen reads it immediately
      addHealthLog(formData);
      setCurrentScreen('confirmation');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof DailyHealthLog, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const inputClass = (f: keyof DailyHealthLog) => errors[f] ? 'input-field-error' : 'input-field';

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="glass-card p-6 space-y-5"
        >
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-white">Daily Health Log</h2>
            <p className="text-text-secondary text-sm mt-1">Track your daily metrics</p>
          </div>

          {/* Water Intake */}
          <div>
            <label className="label-text"><Droplets className="w-4 h-4 text-teal" /> Water Intake (glasses)</label>
            <input type="number" value={formData.waterIntake}
              onChange={e => updateField('waterIntake', e.target.value)}
              placeholder="e.g. 8" className={inputClass('waterIntake')} min="1" max="20" />
            {errors.waterIntake && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.waterIntake}</p>}
          </div>

          {/* Exercise */}
          <div>
            <label className="label-text"><Timer className="w-4 h-4 text-teal" /> Exercise (minutes today)</label>
            <input type="number" value={formData.exercise}
              onChange={e => updateField('exercise', e.target.value)}
              placeholder="e.g. 30" className={inputClass('exercise')} min="0" max="600" />
            {errors.exercise && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.exercise}</p>}
          </div>

          {/* Sleep Hours */}
          <div>
            <label className="label-text"><Moon className="w-4 h-4 text-teal" /> Sleep Hours (last night)</label>
            <input type="number" value={formData.sleepHours}
              onChange={e => updateField('sleepHours', e.target.value)}
              placeholder="e.g. 7.5" className={inputClass('sleepHours')} min="0" max="24" step="0.5" />
            {errors.sleepHours && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.sleepHours}</p>}
          </div>

          {/* Mood */}
          <div>
            <label className="label-text"><span className="text-lg">😊</span> How are you feeling?</label>
            <div className={`grid grid-cols-5 gap-2 p-2 rounded-xl transition-all duration-200 ${errors.mood ? 'border border-error' : ''}`}>
              {moodOptions.map((mood) => (
                <button key={mood.value} type="button" onClick={() => updateField('mood', mood.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                    formData.mood === mood.value
                      ? 'bg-teal/20 border-2 border-teal shadow-glow-teal scale-105'
                      : 'bg-navy/40 border-2 border-transparent hover:bg-card-blue/50 hover:scale-105'
                  }`}>
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className={`text-xs ${formData.mood === mood.value ? 'text-teal font-medium' : 'text-text-secondary'}`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
            {errors.mood && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.mood}</p>}
          </div>

          {/* Calories & Steps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text"><Flame className="w-4 h-4 text-teal" /> Calories</label>
              <input type="number" value={formData.calories}
                onChange={e => updateField('calories', e.target.value)}
                placeholder="kcal" className={inputClass('calories')} min="0" max="10000" />
              {errors.calories && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.calories}</p>}
            </div>
            <div>
              <label className="label-text"><Footprints className="w-4 h-4 text-teal" /> Steps</label>
              <input type="number" value={formData.steps}
                onChange={e => updateField('steps', e.target.value)}
                placeholder="steps" className={inputClass('steps')} min="0" max="100000" />
              {errors.steps && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.steps}</p>}
            </div>
          </div>

          {/* API error */}
          {apiError && (
            <p className="error-text"><AlertCircle className="w-4 h-4" />{apiError}</p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="gradient-btn w-full text-lg flex items-center justify-center gap-2">
            {loading
              ? <><LoadingSpinner size="sm" /> Saving to database…</>
              : <><CheckCircle className="w-5 h-5" /> Submit Entry</>
            }
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
