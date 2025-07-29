import dotenv from 'dotenv';
import { supabase } from './src/lib/supabase.js';

// Load environment variables
dotenv.config();

async function testSetup() {
  console.log('🔧 Testing Airsoft Marketplace Backend Setup...\n');

  // Test 1: Environment Variables
  console.log('1. Checking environment variables...');
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    console.log('Please check your .env file and ensure all required variables are set.');
    return false;
  }
  console.log('✅ Environment variables are configured');

  // Test 2: Supabase Connection
  console.log('\n2. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      console.log('Please check your Supabase credentials and ensure the database is set up.');
      return false;
    }
    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.log('❌ Supabase connection error:', error.message);
    return false;
  }

  // Test 3: Database Tables
  console.log('\n3. Checking database tables...');
  try {
    // Test profiles table
    const { error: profilesError } = await supabase.from('profiles').select('id').limit(1);
    if (profilesError) {
      console.log('❌ Profiles table not found or accessible');
      console.log('Please run the SQL setup scripts in the README.md');
      return false;
    }
    console.log('✅ Profiles table accessible');

    // Test ads table
    const { error: adsError } = await supabase.from('ads').select('id').limit(1);
    if (adsError) {
      console.log('❌ Ads table not found or accessible');
      console.log('Please run the SQL setup scripts in the README.md');
      return false;
    }
    console.log('✅ Ads table accessible');
  } catch (error) {
    console.log('❌ Database table check failed:', error.message);
    return false;
  }

  // Test 4: JWT Configuration
  console.log('\n4. Testing JWT configuration...');
  try {
    const jwksUrl = `${process.env.SUPABASE_URL}/rest/v1/auth/jwks`;
    const response = await fetch(jwksUrl);
    
    if (!response.ok) {
      console.log('❌ JWKS endpoint not accessible');
      console.log('Please check your Supabase URL configuration');
      return false;
    }
    console.log('✅ JWKS endpoint accessible');
  } catch (error) {
    console.log('❌ JWKS endpoint test failed:', error.message);
    return false;
  }

  console.log('\n🎉 All tests passed! Your backend is ready to run.');
  console.log('\nNext steps:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Access API docs: http://localhost:3001/docs');
  console.log('3. Test health endpoint: http://localhost:3001/health');
  
  return true;
}

// Run the test
testSetup().catch(console.error); 