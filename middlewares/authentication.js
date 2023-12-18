const jwt = require('jsonwebtoken');
const secret =  process.env.JWTPRIVATEKEY
const User = require('../models/user');

async function requireAdmin(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  try {
    let dbToken = token.replace("Bearer ", "")
    const decoded = jwt.verify(dbToken, secret);
    console.log(decoded)
    const user = await User.findById(decoded.userId);
    console.log(user)
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = user; // Attach the user to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

async function requireUser(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  try {
    let dbToken = token.replace("Bearer ", "")
    const decoded = jwt.verify(dbToken, secret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach the user to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { requireUser, requireAdmin };
