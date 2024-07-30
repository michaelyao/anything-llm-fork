
require('dotenv').config()
// console.log(process.env)

const NODE_ENV = process.env.NODE_ENV || 'development';


const DB_URL = process.env.DB_URL;
const DB_RAW_URL = process.env.DB_RAW_URL;
const LOG_LEVEL = process.env.LOG_LEVEL || "debug";

// console.log(`Inside config file: DB_URL ${DB_URL}`)


// These are more constant than configurations

const C_PST_TZ = 'America/Los_Angeles';
const C_TIMEFORMAT = 'YYYY-MM-DD-HH-mm-ss'

// console.log(Object.keys(process.env))


// The parameters after the ...process.env will overwrite its content.
module.exports = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || 'development',
  C_TIMEFORMAT,
  C_PST_TZ,
};