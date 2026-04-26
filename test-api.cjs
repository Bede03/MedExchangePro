const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/patients/cmnnl0qff0001imy79qnnk3rh',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImplYW5AZ2xvYmFsLm9yZyIsIm5hbWUiOiJKZWFuIEtvYmVsZSIsInJvbGUiOiJob3NwaXRhbC1hZG1pbiIsImhvc3BpdGFsSWQiOiJjbW5ubDBxZmYwMDAxaW15Nzlxbm5rM3JoIiwiaWF0IjoxNzQ0NTc0NDY3LCJleHAiOjE3NDQ2NjA4Njd9.2pD3tQ8vR4xL6nF9mB2cK1pT5sE8oR3vN9wX4yZ7gA0'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('=== Patient Data ===');
      console.log('Patient ID:', json.patient?.PATIENT_ID);
      console.log('Name:', json.patient?.FIRST_NAME, json.patient?.LAST_NAME);
      console.log('\n=== Medical History ===');
      console.log('Encounters:', json.encounters?.length || 0);
      if (json.encounters?.length > 0) {
        console.log('  First encounter:', JSON.stringify(json.encounters[0], null, 2));
      }
      console.log('Diagnoses:', json.diagnoses?.length || 0);
      if (json.diagnoses?.length > 0) {
        console.log('  First diagnosis:', JSON.stringify(json.diagnoses[0], null, 2));
      }
      console.log('Medications:', json.medications?.length || 0);
      if (json.medications?.length > 0) {
        console.log('  First medication:', JSON.stringify(json.medications[0], null, 2));
      }
      console.log('Lab Results:', json.labResults?.length || 0);
      if (json.labResults?.length > 0) {
        console.log('  First lab result:', JSON.stringify(json.labResults[0], null, 2));
      }
    } catch (e) {
      console.log('Error parsing response:', e.message);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();