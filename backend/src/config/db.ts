import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME || 'needstu';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASS || '';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT || '3306');

// Pre-create the database if it does not exist in XAMPP MySQL
export const ensureDatabaseExists = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPass,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    console.log(`[Database]: Database "${dbName}" checked/created successfully.`);
  } catch (error) {
    console.warn(`[Database Warning]: Could not auto-create database "${dbName}". Attempting to connect anyway...`);
  }
};

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false, // Set to console.log to see SQL queries in terminal
});

export const connectDB = async () => {
  try {
    // 1. Ensure database exists
    await ensureDatabaseExists();
    // 2. Authenticate connection
    await sequelize.authenticate();
    console.log(`[Database]: Connected to MySQL at mysql://${dbUser}@${dbHost}:${dbPort}/${dbName}`);
  } catch (error) {
    console.error('[Database Error]: MySQL connection failed:', error);
  }
};

export default sequelize;
