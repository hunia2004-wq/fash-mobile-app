const BASE_URL = "https://fash-backend-cp3n.vercel.app/api/v1";

// ─────────────────────────────
// CORE REQUEST WRAPPER
// ─────────────────────────────

async function request(endpoint, options = {}) {
  const { headers: customHeaders, ...restOptions } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...restOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
    });
  } catch (err) {
    clearTimeout(timeout);
    throw new Error("Network error or request timeout");
  }

  clearTimeout(timeout);

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.message ||
      `Request failed: ${response.status}`
    );
  }

  return data.data || data;
}

// ─────────────────────────────
// AUTH
// ─────────────────────────────

export async function signup({ firstName, lastName, email, password, fullname }) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, email, password, fullname }),
  });
}

export async function verifyOtp({ email, otp }) {
  return request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function login({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function forgotPassword({ email }) {
  return request("/auth/forgot-password", {
    method: "POST",
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
  return request("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getProfile(token) {
  return request("/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ─────────────────────────────
// PROFILE
// ─────────────────────────────

export async function updateProfile(token, payload) {
  return request("/user/profile", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

// Avatar upload (FormData)
export async function uploadAvatar(token, imageUri) {
  const formData = new FormData();

  formData.append("avatar", {
    uri: imageUri,
    type: "image/jpeg",
    name: "avatar.jpg",
  });

  const response = await fetch(`${BASE_URL}/user/profile/avatar`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || data?.message || "Avatar upload failed"
    );
  }

  return data;
}

// ─────────────────────────────
// EMAIL (OTP FLOW)
// ─────────────────────────────

export async function requestEmailChange(token, newEmail) {
  console.log(token);
  return request("/user/change-email/request", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newEmail }),
  });
}

export async function verifyEmailChange(token, otp) {
  return request("/user/change-email/verify", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ otp }),
  });
}

// ─────────────────────────────
// SETTINGS
// ─────────────────────────────

export async function changePassword(token, { oldPassword, newPassword }) {
  return request("/user/change-password", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function updatePrivacy(token, privacySettings) {
  return request("/user/settings/privacy", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(privacySettings),
  });
}

export async function updateNotifications(token, notificationSettings) {
  return request("/user/settings/notifications", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(notificationSettings),
  });
}

export async function getSettings(token) {
  return request("/user/settings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const getCards = async (token) => {
  return request('/cards', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addCard = async (token, payload) => {
  return request('/cards', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const updateCard = async (token, id, payload) => {
  return request(`/cards/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const setDefaultCard = async (token, id) => {
  return request(`/cards/${id}/default`, {
    method: 'PUT', 
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const deleteCard = async (token, id) => {
  return request(`/cards/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ─────────────────────────────
// ORDERS
// ─────────────────────────────

export async function getOrders(token) {
  return request("/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ─────────────────────────────
// FAVORITES
// ─────────────────────────────

export async function getFavorites(token) {
  return request("/user/favorites", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function addFavorite(token, itemId) {
  return request(`/user/favorites/${itemId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function removeFavorite(token, itemId) {
  return request(`/user/favorites/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ─────────────────────────────
// SAVED ITEMS
// ─────────────────────────────

export async function getSavedItems(token) {
  return request("/user/saved", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function saveItem(token, itemId) {
  return request(`/user/saved/${itemId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function removeSavedItem(token, itemId) {
  return request(`/user/saved/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ─────────────────────────────
// ADDRESSES
// ─────────────────────────────

export async function getAddresses(token) {
  return request("/addresses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data; 
}

export async function addAddress(token, addressData) {
  return request("/addresses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
}

export async function updateAddress(token, id, addressData) {
  return request(`/addresses/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
}

export const setDefaultAddress = async (token, id) => {
  return request(`/addresses/${id}/default`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export async function deleteAddress(token, id) {
  return request(`/addresses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export const getSecurity = (token) => {
  return request('/user/security', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const toggle2FA = (token, data) => {
  return request('/user/security/2fa', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const getLoginDevices = (token) => {
  return request('/user/security/devices', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const removeDevice = (token, id) => {
  return request(`/user/security/devices/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const logoutAllDevices = (token) => {
  return request('/user/security/devices', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const toggleConnectedAccount = (token, data) => {
  return request('/user/connected-accounts', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};


export const contactSupport = async (token, { subject, orderNumber, message, image }) => {
  const formData = new FormData();

  formData.append("subject", subject);
  formData.append("orderNumber", orderNumber);
  formData.append("message", message);

  if (image) {
    formData.append("attachment", {
      uri: image,
      type: "image/jpeg",
      name: "support.jpg",
    });
  }

  return fetch(`${BASE_URL}/support/contact`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }).then(res => res.json());
};

export const getFaqs = (token) => {
  return request("/support/faqs", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};