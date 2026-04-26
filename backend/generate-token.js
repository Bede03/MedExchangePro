const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';

// Generate a token for a CHUK hospital admin
const token = jwt.sign({
  id: 'test-user-id',
  email: 'admin@chuk.rw',
  role: 'admin',
  hospitalId: 'cmnnl0qfc0000imy7e1y26v4j' // CHUK
}, JWT_SECRET, { expiresIn: '7d' });

console.log('Test token:', token);