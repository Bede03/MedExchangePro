# MedExchange Backend API Documentation

## Overview
MedExchange Backend is a robust REST API for managing medical referrals between hospitals, built with Node.js, Express, and PostgreSQL.

## Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Language**: TypeScript
- **Authentication**: JWT
- **Validation**: Zod

## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 14+ or Docker

### Local Development

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Setup database**
```bash
# Create database tables
npm run prisma:push

# Seed initial data
npm run seed
```

4. **Start development server**
```bash
npm run dev
```

The server will start at `http://localhost:5000`

### Using Docker

1. **Start services**
```bash
docker-compose up
```

This will:
- Start PostgreSQL database
- Create database tables
- Seed with mock data
- Start the backend server on port 5000

2. **Stop services**
```bash
docker-compose down
```

## API Endpoints

### Authentication

#### Login
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ user, token }`

#### Signup
- **POST** `/api/auth/signup`
- **Body**: `{ fullName, email, password, role, hospitalId }`
- **Response**: `{ user, token }`

#### Verify Token
- **GET** `/api/auth/verify`
- **Auth**: Bearer token required
- **Response**: `{ user data }`

### Users

#### Get all users (admin only)
- **GET** `/api/users`
- **Auth**: Bearer token required

#### Get users by hospital
- **GET** `/api/users/my-hospital`
- **Auth**: Bearer token required

#### Get user by ID
- **GET** `/api/users/:id`
- **Auth**: Bearer token required

#### Update user
- **PUT** `/api/users/:id`
- **Auth**: Bearer token required
- **Body**: `{ fullName?, email?, role? }`

#### Delete user (admin only)
- **DELETE** `/api/users/:id`
- **Auth**: Bearer token required

### Patients

#### Create patient
- **POST** `/api/patients`
- **Auth**: Bearer token required
- **Body**: `{ name, gender, dob, phone, address, nationalId }`

#### Get patients by hospital
- **GET** `/api/patients`
- **Auth**: Bearer token required

#### Get patient by ID
- **GET** `/api/patients/:id`
- **Auth**: Bearer token required

#### Search patients
- **GET** `/api/patients/search?q=query`
- **Auth**: Bearer token required

#### Update patient
- **PUT** `/api/patients/:id`
- **Auth**: Bearer token required
- **Body**: `{ name?, gender?, dob?, phone?, address? }`

#### Delete patient
- **DELETE** `/api/patients/:id`
- **Auth**: Bearer token required

### Referrals

#### Create referral
- **POST** `/api/referrals`
- **Auth**: Bearer token required
- **Body**: `{ patientId, reason, priority, receivingHospitalId, department? }`

#### Get referrals by hospital
- **GET** `/api/referrals`
- **Auth**: Bearer token required

#### Get referral by ID
- **GET** `/api/referrals/:id`
- **Auth**: Bearer token required

#### Update referral status
- **PUT** `/api/referrals/:id/status`
- **Auth**: Bearer token required
- **Body**: `{ status }`

#### Get referral statistics
- **GET** `/api/referrals/stats`
- **Auth**: Bearer token required

### Hospitals

#### Get all hospitals
- **GET** `/api/hospitals`

#### Get hospital by ID
- **GET** `/api/hospitals/:id`

#### Create hospital (admin only)
- **POST** `/api/hospitals`
- **Auth**: Bearer token required
- **Body**: `{ name, location }`

#### Update hospital (admin only)
- **PUT** `/api/hospitals/:id`
- **Auth**: Bearer token required
- **Body**: `{ name?, location? }`

#### Delete hospital (admin only)
- **DELETE** `/api/hospitals/:id`
- **Auth**: Bearer token required

### Audit Logs

#### Get audit logs by hospital
- **GET** `/api/audit`
- **Auth**: Bearer token required

#### Get all audit logs (admin only)
- **GET** `/api/audit/admin/all`
- **Auth**: Bearer token required

#### Filter audit logs (admin only)
- **GET** `/api/audit/admin/filter?action=&startDate=&endDate=`
- **Auth**: Bearer token required

## User Roles

- **admin**: Full access to all features and admin functions
- **clinician**: Can create referrals, view patients and referrals
- **registrar**: Can manage patient records
- **hospital_staff**: Can view assigned data

## Testing

### Using curl

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "jean@kfh.rw", "password": "password123"}'

# Get patients with token
curl -X GET http://localhost:5000/api/patients \\
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
Import the API collection and update environment variables with your token.

## Database Schema

### Users
- id, fullName, email, password, role, hospitalId, createdAt, updatedAt

### Hospitals
- id, name, location, createdAt, updatedAt

### Patients
- id, name, gender, dob, phone, address, nationalId, hospitalId, createdAt, updatedAt

### Referrals
- id, patientId, reason, status, priority, department, requestingHospitalId, receivingHospitalId, createdAt, updatedAt, completedAt

### AuditLogs
- id, action, entityType, entityId, userId, ipAddress, userAgent, details, timestamp

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/medexchange?schema=public
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

## Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control (RBAC)
- ✅ Input validation (Zod)
- ✅ Audit logging
- ✅ CORS protection
- ✅ Error handling

## Development

### Useful Commands

```bash
# Watch mode development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Prisma commands
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Create migrations
npm run prisma:push        # Sync schema with DB
npm run prisma:studio      # Open Prisma Studio (GUI)

# Seed database
npm run seed
```

## Troubleshooting

### Database connection issues
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify credentials and permissions

### Port already in use
- Change `PORT` in `.env`
- Or kill the process: `lsof -i :5000` then `kill -9 <PID>`

### Seed script fails
- Ensure database exists
- Run `npm run prisma:push` first
- Check user permissions

## Production Deployment

1. Set environment variables
2. Run migrations: `npm run prisma:push`
3. Build: `npm run build`
4. Start: `npm start`

Or use Docker: `docker-compose up -d`

## Support

For issues or questions, contact the MedExchange team.
