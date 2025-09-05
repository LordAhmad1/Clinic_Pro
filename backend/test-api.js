const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('🧪 Testing API connection...');
    
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3000/health', {
      timeout: 5000
    });
    console.log('✅ Health check:', healthResponse.data);
    
    // Test patients endpoint
    console.log('Testing patients endpoint...');
    const patientsResponse = await axios.get('http://localhost:3000/api/v1/patients', {
      timeout: 5000
    });
    console.log('✅ Patients API:', patientsResponse.data);
    
    // Test creating a patient
    console.log('Testing patient creation...');
    const newPatient = {
      name: "API Test Patient",
      phone: "555-123-4567",
      email: "apitest@example.com",
      dateOfBirth: "1990-01-01",
      gender: "male",
      address: "123 API Test St"
    };
    
    const createResponse = await axios.post('http://localhost:3000/api/v1/patients', newPatient, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Created patient:', createResponse.data);
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Server might not be running.');
      console.error('Request error:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
};

testAPI();
