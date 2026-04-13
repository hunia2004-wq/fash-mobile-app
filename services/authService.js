const BASE_URL = "https://fash-backend-cp3n.vercel.app/api/v1";

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

export async function signup({ firstname, lastname, email, password, fullname }) {
    return request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ firstname, lastname, email, password, fullname }),
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

  // ── Profile ─────────────────────────────────────────

export async function updateProfile(token, { name, username, bio, phone }) {
  return request("/user/profile", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, username, bio, phone }),
  });
}

export async function uploadAvatar(token, imageUri) {
  const formData = new FormData();
  formData.append("avatar", { uri: imageUri, type: "image/jpeg", name: "avatar.jpg" });
  const response = await fetch(`${BASE_URL}/user/profile/avatar`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || data.message || "Avatar upload failed");
  return data;
}

// ── Settings ─────────────────────────────────────────

export async function changePassword(token, { currentPassword, newPassword }) {
  return request("/user/change-password", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function updatePrivacy(token, privacySettings) {
  return request("/user/settings/privacy", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(privacySettings),
  });
}

export async function updateNotifications(token, notificationSettings) {
  return request("/user/settings/notifications", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(notificationSettings),
  });
}

export async function updateLanguage(token, { language }) {
  return request("/user/settings/language", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ language }),
  });
}

// ── Orders ───────────────────────────────────────────

export async function getOrders(token) {
  return request("/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Favorites ────────────────────────────────────────

export async function getFavorites(token) {
  return request("/user/favorites", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addFavorite(token, itemId) {
  return request(`/user/favorites/${itemId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function removeFavorite(token, itemId) {
  return request(`/user/favorites/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Saved Items ──────────────────────────────────────

export async function getSavedItems(token) {
  return request("/user/saved", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function saveItem(token, itemId) {
  return request(`/user/saved/${itemId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function removeSavedItem(token, itemId) {
  return request(`/user/saved/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Security ─────────────────────────────────────────

export async function toggle2FA(token, { enabled }) {
  return request("/user/security/2fa", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled }),
  });
}

export async function getLoginDevices(token) {
  return request("/user/security/devices", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function removeDevice(token, deviceId) {
  return request(`/user/security/devices/${deviceId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getConnectedAccounts(token) {
  return request("/user/connected-accounts", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Support ──────────────────────────────────────────

export async function contactSupport(token, { subject, orderNumber, message }) {
  return request("/support/contact", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ subject, orderNumber, message }),
  });
}

// ── Addresses ────────────────────────────────────────

export async function getAddresses(token) {
  return request("/addresses", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addAddress(token, addressData) {
  return request("/addresses", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(addressData),
  });
}

export async function updateAddress(token, id, addressData) {
  return request(`/addresses/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(addressData),
  });
}

export async function setDefaultAddress(token, id) {
  return request(`/addresses/${id}/default`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteAddress(token, id) {
  return request(`/addresses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Cards ────────────────────────────────────────────

export async function getCards(token) {
  return request("/cards", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addCard(token, cardData) {
  return request("/cards", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(cardData),
  });
}

export async function updateCard(token, id, cardData) {
  return request(`/cards/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(cardData),
  });
}

export async function setDefaultCard(token, id) {
  return request(`/cards/${id}/default`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteCard(token, id) {
  return request(`/cards/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}