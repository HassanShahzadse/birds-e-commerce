const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken')
const secret =  process.env.JWTPRIVATEKEY
const baseUrl =  process.env.BACKENDURL
const User = require('../models/user');
const Joi = require('joi');
const sendEmail = require('../middlewares/sendMail')
const schema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().required(),
  gender: Joi.string().required(),
});

async function signup(req, res) {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    const existingUser = await User.findOne({ email });
    console.log(existingUser, '-------------------');

    if (existingUser !== null) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create({
      ...value,
      password: hashedPassword,
      role: 'USER',
    });
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1d' });

    // Construct verification link
    const verificationLink = `${baseUrl}/auth/verify-email?token=${token}`;

    // Send verification email
    const subject = 'Email Verification';
    const text = `Click the following link to verify your email: ${verificationLink}`;
    await sendEmail('hassancy6@gmail.com', subject, text);

    return res.status(201).json({ message: 'An Email has bee sent to your mail , Kindly verify it before logging in' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email: email });
    console.log(user)
    if (!user) {
      return res.status(401).json({ message: 'User Does not Exist' });
    }
    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if(!user.isVerified){
      return res.status(401).json({ message: 'You need to verify your email first' });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '24h' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role,
      email: user.email,
      username:user.name,
      UserId: user.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1d' });

    // Construct verification link
    const verificationLink = `${baseUrl}/auth/verify-email?token=${token}`;

    // Send verification email
    const subject = 'Email Verification';
    const text = `Click the following link to verify your email: ${verificationLink}`;
    await sendEmail(email, subject, text);

    return res.status(200).json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate token with new password
    const token = jwt.sign({ userId: user._id, newPassword }, secret, { expiresIn: '1d' });

    // Construct password reset link
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

    // Send password reset email
    const subject = 'Password Reset';
    const text = `Click the following link to reset your password: ${resetLink}`;
    await sendEmail('hassancy6@gmail.com', subject, text);

    return res.status(200).json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
async function verifyResetPassword(req,res){
  try {
    // Extract token from query parameters
    const token = req.query.token;

    // Verify token
    const decoded = jwt.verify(token, secret); // Verify token with your secret key

    // Extract user ID and new password from token
    const { userId, newPassword } = decoded;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json('Password reset successful, You can now login with the new Password');
  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token expired. Please request a new password reset link.' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function verifySignUp(req,res){
  try {
    // Extract token from query parameters
    const token = req.query.token;

    // Verify token
    const decoded = jwt.verify(token, secret); // Verify token with your secret key

    // Extract user ID from token
    const userId = decoded.userId;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's isVerified field to true
    user.isVerified = true;
    await user.save();

    return res.status(200).json('Email verification successful, You can now log in ');
  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token expired. Please request a new verification link.' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}
module.exports = {
  signup,
  login,
  resetPassword,
  verifySignUp,
  verifyResetPassword,
  resendVerificationEmail
};
