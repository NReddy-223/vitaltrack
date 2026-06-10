import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';

export default async function handler(req: any, res: any) {
  const userId = req.query?.user_id;
  if (!userId) {
    return res.status(400).json({ detail: 'user_id is required' });
  }

  let currentUser: string;
  try {
    currentUser = getCurrentUser(req);
  } catch (err: any) {
    return res.status(401).json({ detail: err.message });
  }

  if (currentUser !== userId) {
    return res.status(403).json({ detail: 'Access denied' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: true });

    if (error) {
      return res.status(500).json({ detail: error.message });
    }

    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const payload = {
      user_id: userId,
      water_intake: body.water_intake,
      exercise_minutes: body.exercise_minutes,
      sleep_hours: body.sleep_hours,
      mood: body.mood,
      calories: body.calories,
      steps: body.steps,
    };

    const { data, error } = await supabase
      .from('health_logs')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ detail: error.message });
    }

    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ detail: 'Method not allowed' });
}
