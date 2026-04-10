import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [120, 'Age cannot exceed 120']
  },
  hobbies: {
    type: [String]
  },
  bio: {
    type: String
  },
  userId: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and apply indexes
userSchema.index({ name: 1 }); // Single field index
userSchema.index({ email: 1, age: 1 }); // Compound index
userSchema.index({ hobbies: 1 }); // Multikey index (since hobbies is an array)
userSchema.index({ bio: 'text' }); // Text index
userSchema.index({ userId: 'hashed' }); // Hashed index
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // TTL index (Expires after 30 days)

const User = mongoose.model('User', userSchema);

export default User;
