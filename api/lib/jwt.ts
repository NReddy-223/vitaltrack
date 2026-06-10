import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';
const TOKEN_EXPIRE_MIN = Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '60');

export function createToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, {
    algorithm: JWT_ALGORITHM as jwt.Algorithm,
    expiresIn: `${TOKEN_EXPIRE_MIN}m`,
  });
}

export function decodeToken(token: string): string {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM as jwt.Algorithm],
    }) as { sub?: string };

    if (!payload?.sub) {
      throw new Error('Invalid token payload');
    }

    return payload.sub;
  } catch {
    throw new Error('Invalid or expired token');
  }
}
