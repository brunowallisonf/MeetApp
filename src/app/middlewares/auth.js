import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const bearerToken = req.headers.authorization;

  if (!bearerToken) {
    return res.status(401).json({ error: 'Token not provided' });
  }
  try {
    const [, token] = bearerToken.split(' ');
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.id = decoded.id;
    return next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid Token' });
  }
};
