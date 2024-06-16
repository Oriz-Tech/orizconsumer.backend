const bcrypt = require('bcryptjs');

function hashPassword(password) {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  } catch (error) {
    throw new Error(`Error hashing password: ${error.message}`);
  }
}

function comparePassword(password, hashedPassword) {
  try {
    const isMatch = bcrypt.compareSync(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Error comparing password: ${error.message}`);
  }
}

module.exports = {
  hashPassword,
  comparePassword
};
