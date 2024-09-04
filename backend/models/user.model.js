const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  createdOn: { type: Date, default: new Date().getTime() },
});

// Pre-save hook to hash the password before saving it to the database
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next(); // Only hash the password if it's new or modified
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(this.password, salt); // Hash the password
    this.password = hashedPassword;
    next(); // Continue to save
  } catch (error) {
    next(error); // Handle errors
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password); // Compare input with stored hash
};

module.exports = mongoose.model('User', userSchema);
