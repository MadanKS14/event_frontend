const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  },

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  },

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getEvents() {
    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  async getEvent(id) {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to fetch event');
    return response.json();
  },

  async createEvent(eventData) {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
  },

  async updateEvent(id, eventData) {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to update event');
    return response.json();
  },

  async deleteEvent(id) {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return response.json();
  },

  async addAttendee(eventId, userId) {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/attendees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to add attendee');
    return response.json();
  },

  async removeAttendee(eventId, userId) {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/attendees`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to remove attendee');
    return response.json();
  },

  async createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  async getEventTasks(eventId) {
    const response = await fetch(`${API_BASE_URL}/tasks/event/${eventId}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async updateTaskStatus(taskId, status) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update task status');
    return response.json();
  },


  async updateUserProfile(userData) {
    // userData will be an object like { name: "New Name", password: "newpassword" }
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    return response.json();
  },

  async createUserByAdmin(userData) {
    const response = await fetch(`${API_BASE_URL}/users`, { // Hits POST /api/users
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }
    return response.json();
  },

  async getEventProgress(eventId) {
    const response = await fetch(`${API_BASE_URL}/tasks/progress/${eventId}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to fetch progress');
    return response.json();
  },
};



