const BASE_URL = "https://nestjs-auth-api-production-90fc.up.railway.app/api/v1";

async function request(endpoint, options ={}) {
    const {headers: customHeaders, ...restOptions } = options;
    const response = await fetch(`${BASE_URL}${endpoint}` , {
        headers: {"Content-Type": "application/json",
        ...customHeaders,
    },
    ...restOptions
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

  export async function verifyOtp({ email, otp }) {
    return request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
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

  export async function verifyResetOtp({ email, otp, newPassword }) {
    return request("/auth/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }
  
  
  export async function logout(token) {
    return request('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  export async function getProfile(token) {
    return request('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }