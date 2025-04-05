import jwt from 'jsonwebtoken';

// JWT Secret - in a real app, use environment variable
const JWT_SECRET = 'boardsync-secret-key';

const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId || decoded.id; // Support both formats
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export { verifyToken, JWT_SECRET };