const User = require('../models/user');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const UserController = {
  // Create a new user
  createUser: async (req, res) => {
    try {
      const { firstName, lastName, email, phone, password, role, gender } = req.body;

      // Check if the email and phone are unique
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Email or phone already exists' });
      }

      const newUser = new User({
        firstName,
        lastName,
        email,
        phone,
        password,
        role,
        gender
      });
      
      await newUser.save();
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      console.error('Error getting all users:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if ID is valid
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Update user details
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phone, role, gender } = req.body;

      // Check if ID is valid
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user properties
     if(firstName) user.firstName = firstName;
    if(lastName)  user.lastName = lastName;
    if(email)  user.email = email;
      if(phone) user.phone = phone;
      if(role) user.role = role;
     if(gender) user.gender = gender;

      await user.save();

      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },


  // Delete a user
  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;

      // Check if the user exists
      if (!isValidObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid User ID.' });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Your code to delete the user
      await User.findByIdAndDelete(userId);

      return res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }

};
function isValidObjectId(id) {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(id);
  }
  
module.exports = UserController;
