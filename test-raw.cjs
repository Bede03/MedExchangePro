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
    console.log('Status:', res.statusCode);
    console.log('Raw response:', data);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();