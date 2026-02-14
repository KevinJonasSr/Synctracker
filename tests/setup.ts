import { beforeAll, afterAll, beforeEach } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  // Set up test environment
  process.env.NODE_ENV = 'test';
  console.log('Test environment initialized');
});

afterAll(async () => {
  // Clean up after all tests
  console.log('Test environment cleaned up');
});

beforeEach(async () => {
  // Reset state before each test if needed
});
