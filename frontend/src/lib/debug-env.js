// Debug script to check environment variables
console.log('=== Environment Variable Debug ===');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('All NEXT_PUBLIC_ vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
console.log('Current API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
console.log('================================'); 