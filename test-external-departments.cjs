const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      rejectUnauthorized: false,
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('🧪 Testing External Departments Endpoint\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in as jean@kfh.rw...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'jean@kfh.rw',
      password: 'password123',
    });
    
    if (loginRes.status !== 200) {
      console.error(`❌ Login failed with status ${loginRes.status}`);
      console.error('Response:', loginRes.data);
      process.exit(1);
    }
    
    const { token, user } = loginRes.data.data;
    console.log(`✅ Login successful!`);
    console.log(`   User: ${user.fullName} (${user.email})`);
    console.log(`   Hospital ID: ${user.hospitalId}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    
    // Step 2: Get external departments
    console.log(`\n2️⃣ Fetching external departments for hospital: ${user.hospitalId}...`);
    const deptRes = await makeRequest('GET', `/api/hospitals/${user.hospitalId}/external-departments`, null, {
      'Authorization': `Bearer ${token}`,
    });
    
    console.log(`   Status: ${deptRes.status}`);
    if (deptRes.status === 200) {
      console.log(`✅ External departments endpoint succeeded!`);
      console.log(`   Response:`, JSON.stringify(deptRes.data, null, 2));
    } else {
      console.error(`❌ External departments endpoint failed!`);
      console.error(`   Status: ${deptRes.status}`);
      console.error(`   Response:`, JSON.stringify(deptRes.data, null, 2));
    }
    
    // Step 3: Also try the internal departments endpoint for comparison
    console.log(`\n3️⃣ Fetching internal departments for comparison...`);
    const internalRes = await makeRequest('GET', `/api/hospitals/${user.hospitalId}/departments`, null, {
      'Authorization': `Bearer ${token}`,
    });
    
    console.log(`   Status: ${internalRes.status}`);
    if (internalRes.status === 200) {
      console.log(`✅ Internal departments endpoint succeeded!`);
      console.log(`   Response:`, JSON.stringify(internalRes.data, null, 2));
    } else {
      console.error(`❌ Internal departments endpoint failed!`);
      console.error(`   Status: ${internalRes.status}`);
      console.error(`   Response:`, JSON.stringify(internalRes.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

test();
