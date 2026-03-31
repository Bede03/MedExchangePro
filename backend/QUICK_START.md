# 🏥 MedExchange Backend - Quick Start Guide

## ✅ What's Been Built

A **production-ready Express.js + PostgreSQL** backend for the MedExchangePro medical referral system with:

### 🎯 Core Features
- ✅ JWT Authentication with role-based access control
- ✅ Complete User management (CRUD operations)
- ✅ Patient records management
- ✅ Medical referral system with status tracking
- ✅ Hospital management
- ✅ Comprehensive audit logging
- ✅ Input validation using Zod
- ✅ Error handling middleware
- ✅ CORS support
- ✅ Docker containerization

### 📊 Database Schema
- **Users**: Full profile + roles (admin, clinician, registrar, hospital_staff)
- **Hospitals**: Multi-hospital support with isolation
- **Patients**: Complete patient records with national ID tracking
- **Referrals**: Inter-hospital referral system with status workflow
- **AuditLogs**: Complete audit trail of all actions
- **Notifications**: System for notifications (ready to extend)

### 🔐 Security
- JWT token-based authentication
- bcryptjs password hashing
- Role-based authorization checks
- Input validation on all endpoints
- Audit logging for compliance
- CORS protection

---

## 🚀 Quick Start (3 Steps)

### Option 1: Using Docker (Easiest)
```bash
cd backend
docker-compose up
```

**That's it!** Your API will be running at `http://localhost:5000`

Database, migrations, and seed data will all run automatically.

### Option 2: Local Setup
Prerequisites: Node.js 18+ and PostgreSQL installed

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure database
cp .env.example .env
# Edit .env and set DATABASE_URL

# 3. Setup database and run
npm run prisma:push
npm run seed
npm run dev
```

---

## 🧪 Test the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Login with Default User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@kfh.rw",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "fullName": "Jean Claude",
      "email": "jean@kfh.rw",
      "role": "admin",
      "hospitalId": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Use Token to Get Referrals
```bash
curl -X GET http://localhost:5000/api/referrals \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 📚 API Endpoints Reference

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/signup` | User registration |
| GET | `/api/auth/verify` | Verify token |

### User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (admin) |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user (admin) |

### Patient Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients` | Create patient |
| GET | `/api/patients` | Get hospital's patients |
| GET | `/api/patients/:id` | Get patient details |
| GET | `/api/patients/search?q=...` | Search patients |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |

### Referral Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/referrals` | Create referral |
| GET | `/api/referrals` | Get hospital's referrals |
| GET | `/api/referrals/:id` | Get referral details |
| PUT | `/api/referrals/:id/status` | Update referral status |
| GET | `/api/referrals/stats` | Get referral statistics |

### Hospital Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hospitals` | Get all hospitals |
| GET | `/api/hospitals/:id` | Get hospital details |
| POST | `/api/hospitals` | Create hospital (admin) |
| PUT | `/api/hospitals/:id` | Update hospital (admin) |
| DELETE | `/api/hospitals/:id` | Delete hospital (admin) |

### Audit Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit` | Get hospital's audit logs |
| GET | `/api/audit/admin/all` | Get all logs (admin) |
| GET | `/api/audit/admin/filter` | Filter logs (admin) |

---

## 📦 Useful Commands

```bash
# Development
npm run dev              # Start in watch mode

# Production
npm run build            # Build TypeScript
npm start                # Start compiled app

# Database
npm run prisma:push      # Sync schema with DB
npm run prisma:migrate   # Create migration
npm run prisma:studio    # Open Prisma Studio GUI
npm run seed             # Seed initial data

# Docker
docker-compose up        # Start all services
docker-compose down      # Stop services
```

---

## 🔑 Default Test Users

| Email | Password | Role | Hospital |
|-------|----------|------|----------|
| jean@kfh.rw | password123 | admin | King Faisal |
| izere@chuk.rw | password123 | clinician | CHUK |
| aline@chuk.rw | password123 | hospital_staff | CHUK |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── schemas/          # Zod validation schemas
│   ├── utils/            # Helper functions
│   └── index.ts          # Main server file
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeder
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔗 Integration with Frontend

Update your frontend's API base URL in `.env`:

```
VITE_API_URL=http://localhost:5000
```

Then update API calls:

```typescript
// Before: using mock data
const response = await fetch('mock-data');

// After: using backend API
const response = await fetch(
  'http://localhost:5000/api/referrals',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

---

## 🛠️ Development Tips

### Debug Database
```bash
npm run prisma:studio
# Opens GUI at http://localhost:5555
```

### View Logs
Set `LOG_LEVEL=debug` in `.env` for verbose logging

### Hot Reload
Dev server uses tsx watch - changes auto-reload

### Database Backup
```bash
# PostgreSQL dump
pg_dump medexchange > backup.sql

# Restore
psql medexchange < backup.sql
```

---

## 📖 Full Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for:
- Complete endpoint reference
- Request/response examples
- Error codes
- Authentication details
- Deployment instructions

---

## ✨ What's Next?

1. **Connect Frontend**: Update frontend API calls to use this backend
2. **Deploy**: Use Docker or deploy to your server
3. **Add Features**: Extend with notifications, real-time updates, etc.
4. **Security**: Use environment variables properly in production
5. **Monitoring**: Add logging and monitoring services

---

## 🆘 Troubleshooting

### Port 5000 already in use?
```bash
# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database connection error?
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify username/password

### Docker issues?
```bash
# Remove old containers
docker-compose down -v

# Rebuild and start fresh
docker-compose up --build
```

---

## 📞 Support

For issues or questions:
1. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review database schema in [prisma/schema.prisma](./prisma/schema.prisma)
3. Check error logs in console

**Happy coding! 🎉**
