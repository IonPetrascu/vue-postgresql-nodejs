import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv'

dotenv.config();
console.log(process.env.DB_PASSWORD);

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

export default client;
