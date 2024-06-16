const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10); 
    const hash = await bcrypt.hash(password, salt); 
    return hash;
  } catch (error) {
    throw new Error(`Error hashing password: ${error.message}`);
  }
}

async function comparePassword(password, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Error comparing password: ${error.message}`);
  }
}

module.exports = {
  hashPassword,
  comparePassword,
};
