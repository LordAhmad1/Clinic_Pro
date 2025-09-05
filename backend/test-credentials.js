require('dotenv').config();

console.log('🔍 Testing MongoDB Atlas Credentials...');
console.log('=====================================');

// Show the connection string (without password for security)
const mongoURI = process.env.MONGODB_URI;
if (mongoURI) {
  const parts = mongoURI.split('@');
  if (parts.length > 1) {
    const credentials = parts[0].replace('mongodb+srv://', '');
    const [username, password] = credentials.split(':');
    console.log('👤 Username:', username);
    console.log('🔑 Password length:', password ? password.length : 0);
    console.log('🔑 Password contains special chars:', /[<>{}[\]]/.test(password || ''));
    console.log('🌐 Cluster:', parts[1].split('/')[0]);
    console.log('🗄️ Database:', parts[1].split('/')[1]?.split('?')[0]);
  }
}

console.log('\n📋 To fix authentication issues:');
console.log('1. Go to MongoDB Atlas: https://cloud.mongodb.com');
console.log('2. Navigate to Database Access');
console.log('3. Check your username is exactly: ahmadbalta999');
console.log('4. Reset your password if needed');
console.log('5. Make sure password has no special characters like: < > { } [ ]');
console.log('6. If password has special chars, URL encode them or use a simpler password');

console.log('\n🔧 Quick fix - try this password format:');
console.log('Replace: LostAhmad123');
console.log('With: LostAhmad123 (if no special chars)');
console.log('Or: LostAhmad123%21 (if you need exclamation mark)');
