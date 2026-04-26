const fetch = globalThis.fetch;

(async () => {
  try {
    // First, authenticate to get the token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jean@kfh.rw', password: 'password123' })
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('Token obtained');

    // Now test the combined endpoint with a patient ID
    // Let's try patient ID 1 first
    const patientResponse = await fetch('http://localhost:5000/api/patients/1/combined', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const patientData = await patientResponse.json();
    console.log('Status:', patientResponse.status);
    console.log('Full response:', JSON.stringify(patientData, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
})();