#!/usr/bin/env node

/**
 * Seeder Runner Script
 * 
 * This script runs the database seeder with proper environment setup
 * and provides clear feedback about the seeding process.
 */

import { runSeeder } from '../../seeder.js';

console.log('🌱 Arkline HR Database Seeder');
console.log('==============================\n');

console.log('📋 This seeder will populate the following:');
console.log('   • User accounts (mike.wilson, jane.smith, bob.anderson, alice.johnson, john.doe)');
console.log('   • Time logs for multiple dates');
console.log('   • Accomplishment logs with detailed activities');
console.log('   • Proper role assignments (admin, manager, employee)\n');

console.log('⚠️  Make sure both MongoDB instances are running:');
console.log('   • User Service MongoDB');
console.log('   • Accomplishment Tracker MongoDB\n');

// Add a small delay to let user read the information
setTimeout(async () => {
    try {
        await runSeeder();
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        process.exit(1);
    }
}, 2000);
