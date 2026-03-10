const BASE_URL = "http://localhost:3000/api/v1";

async function request(endpoint, options ={}) {
    const response = await fetch(`${BASE_URL}${endpoint}` , {
        headers: {"Content-Type": "application/json"},
        ...options,
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || data.message || "Something went wrong");
    }
    return data;
}

export async function signup({ name, email, password }) {
    return request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }
  
  export async function login({ email, password }) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
  
  export async function forgotPassword({ email }) {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
  
  export async function logout(token) {
    return request('/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  export async function getProfile(token) {
    return request('/auth/profile', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }