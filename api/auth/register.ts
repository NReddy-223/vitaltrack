import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';
import { createToken } from '../lib/jwt';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { email, password, full_name } = req.body || {};

  if (!email || !password || !full_name) {
    return res.status(400).json({ detail: 'Email, password, and full name are required' });
  }

  const { data: existingUsers, error: existingError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email);

  if (existingError) {
    return res.status(500).json({ detail: existingError.message });
  }

  if (existingUsers && existingUsers.length > 0) {
    return res.status(400).json({ detail: 'Email already registered' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password_hash, full_name })
    .select('*')
    .single();

  if (error || !data) {
    return res.status(500).json({ detail: error?.message || 'Failed to create user' });
  }

  const access_token = createToken(data.id);
  return res.status(201).json({
    access_token,
    token_type: 'bearer',
    user_id: data.id,
    full_name: data.full_name,
  });
}
