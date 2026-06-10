import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';
import { createToken } from '../lib/jwt';


export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required' });
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1);

  if (error) {
    return res.status(500).json({ detail: error.message });
  }

  const user = users?.[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ detail: 'Invalid email or password' });
  }

  const access_token = createToken(user.id);
  return res.status(200).json({
    access_token,
    token_type: 'bearer',
    user_id: user.id,
    full_name: user.full_name,
  });
}
