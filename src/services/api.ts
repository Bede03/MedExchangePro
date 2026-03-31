// API Service for backend communication
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

export const apiClient = {
  // Get token from localStorage
  getToken: () => localStorage.getItem('auth_token'),

  // Set default headers
  getHeaders: (includeAuth = true) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = apiClient.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  },

  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: apiClient.getHeaders(false),
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    },

    signup: async (
      fullName: string,
      email: string,
      password: string,
      role: string,
      hospitalId: string
    ) => {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: apiClient.getHeaders(false),
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
          hospitalId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      return response.json();
    },

    verify: async () => {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      return response.json();
    },
  },

  // Patient endpoints
  patients: {
    list: async () => {
      const response = await fetch(`${API_URL}/api/patients`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch patients');
      return response.json();
    },

    get: async (id: string) => {
      const response = await fetch(`${API_URL}/api/patients/${id}`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch patient');
      return response.json();
    },

    search: async (query: string) => {
      const response = await fetch(`${API_URL}/api/patients/search?q=${encodeURIComponent(query)}`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },

    create: async (data: any) => {
      const response = await fetch(`${API_URL}/api/patients`, {
        method: 'POST',
        headers: apiClient.getHeaders(true),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create patient');
      return response.json();
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`${API_URL}/api/patients/${id}`, {
        method: 'PUT',
        headers: apiClient.getHeaders(true),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update patient');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/api/patients/${id}`, {
        method: 'DELETE',
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to delete patient');
      return response.json();
    },
  },

  // Referral endpoints
  referrals: {
    list: async () => {
      const response = await fetch(`${API_URL}/api/referrals`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch referrals');
      return response.json();
    },

    get: async (id: string) => {
      const response = await fetch(`${API_URL}/api/referrals/${id}`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch referral');
      return response.json();
    },

    create: async (data: any) => {
      const response = await fetch(`${API_URL}/api/referrals`, {
        method: 'POST',
        headers: apiClient.getHeaders(true),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create referral');
      return response.json();
    },

    updateStatus: async (id: string, status: string) => {
      const response = await fetch(`${API_URL}/api/referrals/${id}/status`, {
        method: 'PUT',
        headers: apiClient.getHeaders(true),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update referral');
      return response.json();
    },

    stats: async () => {
      const response = await fetch(`${API_URL}/api/referrals/stats`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  },

  // Hospital endpoints
  hospitals: {
    list: async () => {
      const response = await fetch(`${API_URL}/api/hospitals`, {
        headers: apiClient.getHeaders(false),
      });

      if (!response.ok) throw new Error('Failed to fetch hospitals');
      return response.json();
    },

    get: async (id: string) => {
      const response = await fetch(`${API_URL}/api/hospitals/${id}`, {
        headers: apiClient.getHeaders(false),
      });

      if (!response.ok) throw new Error('Failed to fetch hospital');
      return response.json();
    },
  },

  // User endpoints
  users: {
    list: async () => {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },

    get: async (id: string) => {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },

    create: async (data: any) => {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: apiClient.getHeaders(true),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },

    update: async (id: string, data: any) => {
      const updatePayload: any = {};
      
      console.log('🔍 API update called with:', data);
      
      if (data.full_name) updatePayload.fullName = data.full_name;
      if (data.email) updatePayload.email = data.email;
      if (data.password) updatePayload.password = data.password;
      if (data.role) updatePayload.role = data.role;
      
      console.log('📤 Sending updatePayload:', updatePayload);
      
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: apiClient.getHeaders(true),
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
  },

  // Patient Records endpoints
  patientRecords: {
    share: async (data: any) => {
      const response = await fetch(`${API_URL}/api/patient-records/share`, {
        method: 'POST',
        headers: apiClient.getHeaders(true),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to share patient records');
      return response.json();
    },

    getShared: async () => {
      const response = await fetch(`${API_URL}/api/patient-records/shared`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch shared records');
      return response.json();
    },

    getByReferral: async (referralId: string) => {
      const response = await fetch(`${API_URL}/api/patient-records/referral/${referralId}`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch referral records');
      return response.json();
    },
  },

  // Audit endpoints
  audit: {
    list: async () => {
      const response = await fetch(`${API_URL}/api/audit`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    },
  },

  // Notification endpoints
  notifications: {
    list: async () => {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },

    getUnread: async () => {
      const response = await fetch(`${API_URL}/api/notifications/unread`, {
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to fetch unread notifications');
      return response.json();
    },

    markAsRead: async (id: string) => {
      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },

    markAllAsRead: async () => {
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to mark all as read');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: apiClient.getHeaders(true),
      });

      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
  },
};
