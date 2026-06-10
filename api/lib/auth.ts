import { decodeToken } from './jwt';

export function getCurrentUser(req: any): string {
  const authHeader = String(req.headers?.authorization || '');
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!token) {
    throw new Error('Missing authorization token');
  }

  return decodeToken(token);
}
