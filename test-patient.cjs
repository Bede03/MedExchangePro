const http = require('http');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtbm5sMHFpaDAwMHZpbXk3aXB1cmo5d3EiLCJlbWFpbCI6ImplYW5Aa2ZoLnJ3Iiwicm9sZSI6ImFkbWluIiwiaG9zcGl0YWxJZCI6ImNtbm5sMHFmZjAwMDFpbXk3OXFubmszcmgiLCJpYXQiOjE3NzcwNjkzMDUsImV4cCI6MTc3NzY3NDEwNX0.6Z5S4o3FGRLA838XC0oqsiQ4pPAT-0WaoqpIL2oexZo";

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/patients/1?hospitalId=KFH',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();