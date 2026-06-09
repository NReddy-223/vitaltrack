import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Users, Weight, Ruler, Target, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PersonalDetails } from '../types';
import { apiSaveProfile } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

export default function PersonalDetailsScreen() {
  const { setPersonalDetails, setCurrentScreen, authToken, userId } = useApp();

  const [formData, setFormData] = useState<PersonalDetails>({
    fullName: '', age: '', gender: '', weight: '', height: '', healthGoal: '',
  });
  const [errors, setErrors]   = useState<Partial<PersonalDetails>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Partial<PersonalDetails> = {};
    if (!formData.fullName.trim()) e.fullName = 'Full name is required';
    if (!formData.age.trim()) e.age = 'Age is required';
    else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120)
      e.age = 'Age must be between 1 and 120';
    if (!formData.gender) e.gender = 'Please select a gender';
    if (!formData.weight.trim()) e.weight = 'Weight is required';
    else if (isNaN(Number(formData.weight)) || Number(formData.weight) < 1 || Number(formData.weight) > 300)
      e.weight = 'Weight must be between 1 and 300 kg';
    if (!formData.height.trim()) e.height = 'Height is required';
    else if (isNaN(Number(formData.height)) || Number(formData.height) < 1 || Number(formData.height) > 250)
      e.height = 'Height must be between 1 and 250 cm';
    if (!formData.healthGoal) e.healthGoal = 'Please select a health goal';
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
        await apiSaveProfile(userId, {
          full_name:   formData.fullName,
          age:         Number(formData.age),
          gender:      formData.gender,
          weight:      Number(formData.weight),
          height:      Number(formData.height),
          health_goal: formData.healthGoal,
        }, authToken);
      }
      setPersonalDetails(formData);
      setCurrentScreen('daily-log');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof PersonalDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const inputClass  = (f: keyof PersonalDetails) => errors[f] ? 'input-field-error' : 'input-field';
  const selectClass = (f: keyof PersonalDetails) => errors[f] ? 'select-field-error' : 'select-field';

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
            <h2 className="text-2xl font-bold text-white">Personal Details</h2>
            <p className="text-text-secondary text-sm mt-1">Tell us about yourself</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="label-text"><User className="w-4 h-4 text-teal" /> Full Name</label>
            <input type="text" value={formData.fullName}
              onChange={e => updateField('fullName', e.target.value)}
              placeholder="Enter your full name" className={inputClass('fullName')} />
            {errors.fullName && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.fullName}</p>}
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text"><Calendar className="w-4 h-4 text-teal" /> Age</label>
              <input type="number" value={formData.age} onChange={e => updateField('age', e.target.value)}
                placeholder="Age" className={inputClass('age')} min="1" max="120" />
              {errors.age && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.age}</p>}
            </div>
            <div>
              <label className="label-text"><Users className="w-4 h-4 text-teal" /> Gender</label>
              <select value={formData.gender} onChange={e => updateField('gender', e.target.value)}
                className={selectClass('gender')}>
                <option value="" disabled>Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
              {errors.gender && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.gender}</p>}
            </div>
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text"><Weight className="w-4 h-4 text-teal" /> Weight (kg)</label>
              <input type="number" value={formData.weight} onChange={e => updateField('weight', e.target.value)}
                placeholder="kg" className={inputClass('weight')} min="1" max="300" step="0.1" />
              {errors.weight && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.weight}</p>}
            </div>
            <div>
              <label className="label-text"><Ruler className="w-4 h-4 text-teal" /> Height (cm)</label>
              <input type="number" value={formData.height} onChange={e => updateField('height', e.target.value)}
                placeholder="cm" className={inputClass('height')} min="1" max="250" step="0.1" />
              {errors.height && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.height}</p>}
            </div>
          </div>

          {/* Health Goal */}
          <div>
            <label className="label-text"><Target className="w-4 h-4 text-teal" /> Health Goal</label>
            <select value={formData.healthGoal} onChange={e => updateField('healthGoal', e.target.value)}
              className={selectClass('healthGoal')}>
              <option value="" disabled>Select your health goal</option>
              <option value="Lose Weight">🏋️ Lose Weight</option>
              <option value="Build Muscle">💪 Build Muscle</option>
              <option value="Stay Healthy">🌿 Stay Healthy</option>
              <option value="Improve Sleep">😴 Improve Sleep</option>
            </select>
            {errors.healthGoal && <p className="error-text"><AlertCircle className="w-3 h-3" />{errors.healthGoal}</p>}
          </div>

          {/* API error */}
          {apiError && (
            <p className="error-text"><AlertCircle className="w-4 h-4" />{apiError}</p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="gradient-btn w-full text-lg flex items-center justify-center gap-2">
            {loading ? <><LoadingSpinner size="sm" /> Saving…</> : <>Next <ArrowRight className="w-5 h-5" /></>}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
