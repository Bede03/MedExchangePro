const http = require('http');

// First, login to get a fresh token
const loginData = JSON.stringify({
  email: 'jean@kfh.rw',
  password: 'password123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Login status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      const token = json.data?.token || json.token;
      console.log('Got token:', token ? 'yes' : 'no');
      
      if (token) {
        testPatientEndpoint(token);
      }
    } catch (e) {
      console.log('Error parsing login response:', e.message);
    }
  });
});

loginReq.on('error', (e) => {
  console.error('Login request error:', e.message);
});

loginReq.write(loginData);
loginReq.end();

function testPatientEndpoint(token) {
  const patientOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/patients/1198805121234567/combined',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const patientReq = http.request(patientOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('\n=== Patient Data ===');
      console.log('Status:', res.statusCode);
      try {
        const json = JSON.parse(data);
        // Handle response format: { success: true, data: { patient, externalHistory } }
        const patientData = json.data?.patient;
        
        console.log('Patient ID:', patientData?.id);
        console.log('Name:', patientData?.name);
        console.log('Gender:', patientData?.gender);
        console.log('National ID:', patientData?.nationalId);
        
        const encounters = patientData?.encounters || [];
        const diagnoses = patientData?.diagnoses || [];
        const medications = patientData?.medications || [];
        const labResults = patientData?.labResults || [];
        console.log('\n=== Medical History ===');
        console.log('Encounters:', encounters.length);
        if (encounters.length > 0) {
          console.log('  First encounter:', JSON.stringify(encounters[0], null, 2));
        }
        console.log('Diagnoses:', diagnoses.length);
        if (diagnoses.length > 0) {
          console.log('  First diagnosis:', JSON.stringify(diagnoses[0], null, 2));
        }
        console.log('Medications:', medications.length);
        if (medications.length > 0) {
          console.log('  First medication:', JSON.stringify(medications[0], null, 2));
        }
        console.log('Lab Results:', labResults.length);
        if (labResults.length > 0) {
          console.log('  First lab result:', JSON.stringify(labResults[0], null, 2));
        }
      } catch (e) {
        console.log('Error parsing patient response:', e.message);
        console.log('Raw data:', data);
      }
    });
  });

  patientReq.on('error', (e) => {
    console.error('Patient request error:', e.message);
  });

  patientReq.end();
}