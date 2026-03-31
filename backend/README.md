# MedExchange Backend

A production-ready REST API for managing medical referrals between hospitals.

## Quick Start

### Option 1: Docker (Recommended)
```bash
cd backend
docker-compose up
```

### Option 2: Local Setup
```bash
cd backend
npm install
cp .env.example .env
npm run prisma:push
npm run seed
npm run dev
```

## API Base URL
- **Development**: `http://localhost:5000`
- **Production**: Your deployed domain

## Key Features

✅ **Authentication** - JWT-based with role-based access control  
✅ **Patient Management** - Create, update, search patient records  
✅ **Referral System** - Create inter-hospital medical referrals  
✅ **Hospital Management** - Manage multiple hospitals  
✅ **Audit Logging** - Complete audit trail of all actions  
✅ **Input Validation** - Zod schema validation  
✅ **Error Handling** - Comprehensive error messages  

## Database
- **Type**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: Automatic with Prisma

## Documentation
See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Development Scripts
```bash
npm run dev              # Run in watch mode
npm run build            # Build for production
npm start                # Start production server
npm run prisma:studio    # Open database GUI
npm run seed             # Seed database with mock data
```

## Default Test Users
- **Admin**: jean@kfh.rw / password123
- **Clinician**: izere@chuk.rw / password123
- **Staff**: aline@chuk.rw / password123

## License
MIT
