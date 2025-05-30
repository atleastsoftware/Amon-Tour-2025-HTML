#!/usr/bin/env node

/**
 * Setup script for Tour Ninja integration
 * This script helps configure the API credentials for each company instance
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('\n🚀 Tour Ninja Integration Setup\n');
  console.log('This will configure your Tour Ninja API credentials securely.\n');

  try {
    // Get API credentials
    const apiKey = await question('Enter your Tour Ninja API Key: ');
    const companyId = await question('Enter your Tour Ninja Company ID: ');
    const companyName = await question('Enter your Company Name (optional): ') || 'Amon Tour';
    const domain = await question('Enter your domain (optional): ') || 'localhost';

    // Create .env file
    const envContent = `# Tour Ninja Configuration
TOUR_NINJA_API_KEY=${apiKey}
TOUR_NINJA_COMPANY_ID=${companyId}

# Company Configuration
COMPANY_NAME=${companyName}
COMPANY_DOMAIN=${domain}
ALLOWED_DOMAINS=${domain},localhost,127.0.0.1

# Session Configuration
SESSION_SECRET=${generateRandomSecret()}
`;

    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ Configuration saved to .env file');
    console.log('🔒 Your API credentials are stored securely');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your application');
    console.log('2. Your Tour Ninja tours will now be displayed automatically');
    console.log('3. Check /external-stays to see all external tours');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

function generateRandomSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

// Check if .env already exists
if (fs.existsSync('.env')) {
  question('\n⚠️  .env file already exists. Overwrite? (y/N): ').then((answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      setup();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  setup();
}