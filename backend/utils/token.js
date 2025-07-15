// const jwt = require('jsonwebtoken');

// const createToken = (userId) => {
//   return jwt.sign({ user_id: userId }, process.env.JWT_SECRET, {
//     expiresIn: '1h',
//   });
// };

// module.exports = { createToken };


const jwt = require('jsonwebtoken');

exports.createToken = (userId) => {
  return jwt.sign({ user_id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};