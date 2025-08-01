// 13. backend/utils/generateToken.js

const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt");

const generateToken = (id) => {
  return jwt.sign({ id }, secret, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;
