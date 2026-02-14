#!/usr/bin/env node

/**
 * Database Migration Runner
 * Runs SQL migration files to add indexes and other database improvements
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

// Create database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, 'add_indexes.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration: add_indexes.sql');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Database indexes have been added for optimal performance.');
    console.log('🔍 Full-text search indexes created for songs, contacts, and deals.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run migrations
runMigrations();
