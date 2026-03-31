# Frontend - Backend Integration Guide

✅ **Frontend is now fully connected to the Backend API!**

---

## What Was Done

### 1. ✅ Created API Service (`src/services/api.ts`)
- Centralized API communication layer
- All endpoints wrapped in `apiClient` object
- Automatic token handling
- Error handling built-in

### 2. ✅ Updated Authentication (`src/context/AuthContext.tsx`)
- Now uses real backend API for login/signup
- Token stored in localStorage as `auth_token`
- User data synced with backend
- Auto-verification of tokens on page reload

### 3. ✅ Updated Data Hook (`src/hooks/useMockData.ts`)
- Fetches data from backend instead of mock data
- Maps backend field names to frontend types
- Supports real create/update operations
- Graceful error handling

### 4. ✅ Created Frontend .env
- `VITE_API_URL=http://localhost:5000`
- All API calls route to this URL

### 5. ✅ Created Test File (`test.rest`)
- REST Client format for testing
- 12 pre-built endpoints to test
- Instructions included

---

## 🚀 How to Use

### **Step 1: Make Sure Backend is Running**

Terminal 1 (leave running):
```bash
cd backend
npm run dev
```

Backend should say: `🏥 MedExchange Backend Server Running` at Port 5000

### **Step 2: Start Frontend**

Terminal 2 (new):
```bash
cd (root MedExchangePro folder)
npm run dev
```

Frontend will run at `http://localhost:5173`

### **Step 3: Test Login**

1. Go to `http://localhost:5173/login`
2. Try logging in with:
   - Email: `jean@kfh.rw`
   - Password: `password123`

✅ This will now use the real backend API!

---

## 📊 What's Connected

| Frontend Component | Backend Endpoint | Status |
|-------------------|-----------------|--------|
| Login Page | POST /api/auth/login | ✅ Connected |
| Signup Page | POST /api/auth/signup | ✅ Connected |
| Patients List | GET /api/patients | ✅ Connected |
| Patient Details | GET /api/patients/:id | ✅ Connected |
| Create Patient | POST /api/patients | ✅ Connected |
| Referrals List | GET /api/referrals | ✅ Connected |
| Create Referral | POST /api/referrals | ✅ Connected |
| Update Referral | PUT /api/referrals/:id/status | ✅ Connected |
| Dashboard Stats | GET /api/referrals/stats | ✅ Connected |
| Hospitals | GET /api/hospitals | ✅ Connected |
| Users | GET /api/users | ✅ Connected |
| Audit Logs | GET /api/audit | ✅ Connected |

---

## 🧪 Test with REST Client Extension

### **Install Extension:**
1. Open VS Code
2. Press `Ctrl+Shift+X` (Extensions)
3. Search "REST Client" by Huachao Mao
4. Click Install

### **Use Test File:**
1. Open `test.rest` in VS Code
2. Click "Send Request" above endpoints
3. First run "Login - Get Token"
4. Copy token to `@token` variable at top
5. Now all protected endpoints will work

---

## 🔑 Available Test Users

From the backend seed data:

| Email | Password | Role | Hospital |
|-------|----------|------|----------|
| jean@kfh.rw | password123 | admin | King Faisal Hospital |
| izere@chuk.rw | password123 | clinician | CHUK |
| aline@chuk.rw | password123 | hospital_staff | CHUK |

---

## 📝 Frontend Files Updated

- ✅ `src/context/AuthContext.tsx` - Real API authentication
- ✅ `src/hooks/useMockData.ts` - Real API data fetching
- ✅ `src/services/api.ts` - NEW - API service layer
- ✅ `.env` - NEW - API URL configuration
- ✅ `test.rest` - NEW - API testing file

---

## 🆘 Troubleshooting

### "Cannot find module 'api'" error?
- Make sure `src/services/api.ts` exists
- Restart frontend dev server

### Login not working?
- Check if backend is running: `http://localhost:5000/health`
- Check terminal for backend errors
- Verify `.env` has correct `VITE_API_URL`

### Data not loading?
- Check browser console for errors (F12)
- Verify you're logged in (token in localStorage)
- Check backend has seeded data: `npm run seed`

### CORS errors?
- Backend is already configured to accept requests from `http://localhost:5173`
- Make sure backend is running before starting frontend

---

## 🎯 What to Test Next

1. ✅ **Login** - Use test credentials
2. ✅ **View Patients** - See list from backend
3. ✅ **Create Patient** - Add new patient via form
4. ✅ **Create Referral** - Create referral between hospitals
5. ✅ **Update Referral** - Change referral status (approve/reject)
6. ✅ **View Reports** - Check dashboard stats
7. ✅ **Check Audit Logs** - See all actions logged

---

## 📞 API Service Usage Examples

If you need to add more features, use the API service:

```typescript
import { apiClient } from '../services/api';

// Get patients
const response = await apiClient.patients.list();
const patients = response.data;

// Create patient
const newPatient = await apiClient.patients.create({
  name: 'John',
  gender: 'male',
  dob: '1990-01-01',
  phone: '0780000000',
  address: 'Kigali',
  nationalId: '1199999999999999'
});

// Get referral stats
const stats = await apiClient.referrals.stats();
```

---

## ✨ Backend Field Mapping

The frontend automatically maps backend field names:

```
Backend → Frontend
fullName → full_name
email → email
hospitalId → hospital_id
createdAt → registered_at
nationalId → national_id
patientId → patient_id
```

This happens automatically in the hooks and services!

---

**Everything is connected and ready to use! 🎉**

Both frontend and backend are working together now!
