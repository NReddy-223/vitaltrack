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
      .from('personal_details')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ detail: error.message });
    }

    return res.status(200).json(data || null);
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const payload = {
      user_id: userId,
      full_name: body.full_name,
      age: body.age,
      gender: body.gender,
      weight: body.weight,
      height: body.height,
      health_goal: body.health_goal,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('personal_details')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ detail: error.message });
    }

    return res.status(200).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ detail: 'Method not allowed' });
}
