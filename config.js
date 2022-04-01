const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcpc'
const PORT = process.env.PORT || 5000
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`
const API_CODE = process.env.API_CODE || 'ST-ANTOI134934_A9IA5'
const API_PASSWORD = process.env.API_PASSWORD || '@bt8}#4fd{'

module.exports = {
  BASE_URL,
  PORT,
  ROOT_DIR: __dirname,
  MONGODB_URI,
  API_CODE,
  API_PASSWORD
};