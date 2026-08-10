import { jwtSecret } from '@/configs/app.js';
import type { Role } from '@/types/users.js';
import jwt from 'jsonwebtoken';

export function generateTokensPair(payload: { userId: string; role: Role }) {
  const tokenId = crypto.randomUUID()

  const accessToken = jwt.sign(payload, jwtSecret, {
    expiresIn: '15m',
    jwtid: tokenId,
  })

  const refreshToken = jwt.sign(payload, jwtSecret, {
    expiresIn: '7d',
    jwtid: tokenId,
  })

  return [accessToken, refreshToken, tokenId]
}
