#!/usr/bin/env node

/**
 * Script to check the total size of environment variables
 * This helps identify if you're approaching the 4KB Lambda limit
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
const envLocalPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
      envVars[key.trim()] = value.trim();
    }
  });
}

// Also check process.env (for variables already set)
const allEnvVars = { ...process.env, ...envVars };

// Calculate sizes
const buildTimeVars = {};
const runtimeVars = {};
let buildTimeSize = 0;
let runtimeSize = 0;

Object.entries(allEnvVars).forEach(([key, value]) => {
  // Skip Node.js and system variables
  if (key.startsWith('npm_') || key.startsWith('PATH') || key.startsWith('HOME') || 
      key.startsWith('USER') || key.startsWith('SHELL') || key === 'NODE_ENV') {
    return;
  }

  const size = Buffer.byteLength(`${key}=${value}`, 'utf8');
  
  if (key.startsWith('NEXT_PUBLIC_')) {
    buildTimeVars[key] = { size, length: value.length };
    buildTimeSize += size;
  } else {
    runtimeVars[key] = { size, length: value.length };
    runtimeSize += size;
  }
});

// Sort by size (largest first)
const sortBySize = (a, b) => b[1].size - a[1].size;

console.log('='.repeat(80));
console.log('Environment Variable Size Analysis');
console.log('='.repeat(80));
console.log();

console.log(`📦 Build-time variables (NEXT_PUBLIC_*): ${Object.keys(buildTimeVars).length} variables, ${(buildTimeSize / 1024).toFixed(2)} KB`);
console.log(`⚙️  Runtime variables (for Lambda): ${Object.keys(runtimeVars).length} variables, ${(runtimeSize / 1024).toFixed(2)} KB`);
console.log(`📊 Total size: ${((buildTimeSize + runtimeSize) / 1024).toFixed(2)} KB`);
console.log();

const limitKB = 4;
if (runtimeSize > limitKB * 1024) {
  console.log(`❌ ERROR: Runtime variables exceed ${limitKB}KB limit!`);
  console.log(`   Current size: ${(runtimeSize / 1024).toFixed(2)} KB`);
  console.log(`   Over by: ${((runtimeSize - limitKB * 1024) / 1024).toFixed(2)} KB`);
  console.log();
} else {
  console.log(`✅ Runtime variables are within ${limitKB}KB limit`);
  console.log(`   Remaining: ${((limitKB * 1024 - runtimeSize) / 1024).toFixed(2)} KB`);
  console.log();
}

console.log('Top 10 Largest Runtime Variables:');
console.log('-'.repeat(80));
Object.entries(runtimeVars)
  .sort(sortBySize)
  .slice(0, 10)
  .forEach(([key, { size, length }]) => {
    const value = allEnvVars[key];
    const displayValue = length > 50 ? `${value.substring(0, 47)}...` : value;
    console.log(`  ${key.padEnd(40)} ${(size / 1024).toFixed(2)} KB (${length} chars)`);
    if (key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN')) {
      console.log(`    ${'*'.repeat(Math.min(50, length))}`);
    } else if (length <= 100) {
      console.log(`    ${displayValue}`);
    }
  });

console.log();
console.log('='.repeat(80));
console.log('💡 Tips:');
console.log('  1. Build-time (NEXT_PUBLIC_*) variables are embedded in the bundle');
console.log('  2. Only runtime variables count toward the 4KB Lambda limit');
console.log('  3. Reduce sizes by:');
console.log('     - Using shorter API keys/tokens where possible');
console.log('     - Ensuring FIREBASE_PRIVATE_KEY uses \\n (not actual newlines)');
console.log('     - Removing unused environment variables');
console.log('='.repeat(80));

process.exit(runtimeSize > limitKB * 1024 ? 1 : 0);

