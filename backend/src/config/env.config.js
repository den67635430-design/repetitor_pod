// src/config/env.config.js
// Centralized environment variable validation

const requiredEnvVars = [
  'JWT_SECRET',
  'ANTHROPIC_API_KEY',
  'DATABASE_URL'
];

const optionalEnvVars = [
  { name: 'TELEGRAM_BOT_TOKEN', dependents: ['ADMIN_TELEGRAM_ID'] },
  { name: 'BCRYPT_ROUNDS', default: '12' },
  { name: 'NODE_ENV', default: 'development' },
  { name: 'PORT', default: '4000' },
  { name: 'WEB_URL', default: 'http://localhost:3000' }
];

function validateEnvironment() {
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('FATAL: Missing required environment variables:');
    missing.forEach(v => console.error(`  - ${v}`));
    console.error('');
    console.error('Please set these variables before starting the server.');
    console.error('See backend/.env.example for documentation.');
    console.error('═══════════════════════════════════════════════════════════');
    process.exit(1);
  }

  // Check optional variables with dependencies
  for (const opt of optionalEnvVars) {
    if (typeof opt === 'object' && opt.dependents) {
      if (process.env[opt.name]) {
        for (const dep of opt.dependents) {
          if (!process.env[dep]) {
            warnings.push(`${opt.name} is set but ${dep} is missing`);
          }
        }
      }
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(w => console.warn(`   - ${w}`));
  }

  return {
    JWT_SECRET: process.env.JWT_SECRET,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    ADMIN_TELEGRAM_ID: process.env.ADMIN_TELEGRAM_ID,
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '4000'),
    WEB_URL: process.env.WEB_URL || 'http://localhost:3000'
  };
}

module.exports = { validateEnvironment, requiredEnvVars, optionalEnvVars };
