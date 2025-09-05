require('dotenv').config();
const mongoose = require('mongoose');

// Set the MongoDB URI with the new password
const mongoURI = "mongodb+srv://ahmadbalta999:bhbB0ui1n2xiMu6x@clinicpro.eq1rpkd.mongodb.net/medical_clinic";

// Define Patient Schema
const patientSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  dateOfBirth: String,
  gender: String,
  address: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', patientSchema);

const testMongoDBSave = async () => {
  try {
    console.log('🔍 Testing MongoDB Atlas Data Saving...');
    console.log('=====================================');
    
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas!');
    
    // Create a test patient
    console.log('➕ Creating test patient...');
    const testPatient = new Patient({
      name: 'Test Patient Atlas',
      phone: '123-456-7890',
      email: 'test@atlas.com',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: '123 Atlas Test St'
    });
    
    // Save to database
    const savedPatient = await testPatient.save();
    console.log('✅ Patient saved to MongoDB Atlas!');
    console.log('📋 Patient ID:', savedPatient._id);
    console.log('📋 Patient Name:', savedPatient.name);
    
    // Retrieve from database
    console.log('🔍 Retrieving patient from database...');
    const retrievedPatient = await Patient.findById(savedPatient._id);
    console.log('✅ Patient retrieved from MongoDB Atlas!');
    console.log('📋 Retrieved Name:', retrievedPatient.name);
    
    // Count all patients
    const patientCount = await Patient.countDocuments();
    console.log('📊 Total patients in database:', patientCount);
    
    // List all patients
    const allPatients = await Patient.find();
    console.log('📋 All patients in database:');
    allPatients.forEach((patient, index) => {
      console.log(`  ${index + 1}. ${patient.name} (${patient.phone})`);
    });
    
    console.log('\n🎉 SUCCESS! Data is being saved to MongoDB Atlas!');
    console.log('💡 Check your Atlas dashboard to see the new patient.');
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('🔍 Full error:', error);
  }
};

testMongoDBSave();
