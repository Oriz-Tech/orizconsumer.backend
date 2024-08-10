const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

function generateToken(userId){
  const token = jwt.sign({userId: userId}, process.env.JWTSECRET, {expiresIn: `${process.env.JWTEXPIRES}`});
  return token;
}

function verifyToken(token){
  try {
    let decoded = jwt.verify(token, process.env.JWTSECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid Access token');
  }
}

function generateReferalLink() {
  const numbers = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  
  let result = '';
  for (let i = 0; i < 7; i++) {
      result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
  const randomPosition = Math.floor(Math.random() * result.length);
  result = result.slice(0, randomPosition) + randomLetter + result.slice(randomPosition);
  
  return result;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateReferalLink
};
