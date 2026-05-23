const BASE_URL = "https://fash-backend-cp3n.vercel.app/api/v1";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fire-and-forget on app start to pre-warm Vercel serverless functions
export async function warmupServer() {
  const endpoints = ['/listings', '/saved'];
  await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        await fetch(`${BASE_URL}${endpoint}`, { signal: controller.signal });
        clearTimeout(timeoutId);
      } catch {
        // best-effort — ignore errors
      }
    })
  );
}

// ── CORE REQUEST WRAPPER ───────────────────────────────────────────
// NOTE: Do NOT use request() for FormData endpoints.
// FormData requires fetch to auto-set multipart/form-data + boundary.
// Use uploadFormData() instead for: createListing, createWardrobeItem, createAuction, uploadAvatar.

async function request(endpoint, options = {}, retries = 2, attempt = 0) {
  const { headers: customHeaders, body, ...restOptions } = options;

  const timeoutMs = attempt === 0 ? 60000 : 30000;
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...restOptions,
      signal: controller.signal,
      headers: {
        ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...customHeaders,
      },
      body,
    });

    clearTimeout(timeoutId);

    let data = {};
    try { data = await response.json(); } catch { }

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
        data?.message ||
        `Request failed: ${response.status}`
      );
    }

    return data.data || data;

  } catch (err) {
    clearTimeout(timeoutId);

    const isTimeout = err.name === 'AbortError';
    const isNetwork = err.message?.includes('Network request failed');

    if ((isTimeout || isNetwork) && retries > 0) {
      console.log(`Retrying ${endpoint}... (${retries} left)`);
      await sleep(2000);
      return request(endpoint, options, retries - 1, attempt + 1);
    }

    if (isTimeout) {
      throw new Error('The server took too long to respond. Please check your connection and try again.');
    }

    throw err;
  }
}

// ── Shared raw-fetch helper for ALL FormData POSTs ────────────────
// Bypasses request() so fetch can auto-set multipart/form-data + boundary.
async function uploadFormData(endpoint, token, formData) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // NO Content-Type — fetch sets multipart/form-data + boundary automatically
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.message ||
      `Request failed: ${response.status}`
    );
  }

  return data.data || data;
}


// AUTHENTICATION
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
    headers: { Authorization: `Bearer ${token}` },
  });
}


// PROFILE
export async function getProfile(token) {
  return request("/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateProfile(token, payload) {
  return request("/user/profile", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

// Avatar upload — raw fetch, NOT request()
export async function uploadAvatar(token, imageUri) {
  const formData = new FormData();
  formData.append("avatar", { uri: imageUri, type: "image/jpeg", name: "avatar.jpg" });

  const response = await fetch(`${BASE_URL}/user/profile/avatar`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || "Avatar upload failed");
  }
  return data;
}


// EMAIL OTP FLOW
export async function requestEmailChange(token, newEmail) {
  return request("/user/change-email/request", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ newEmail }),
  });
}

export async function verifyEmailChange(token, otp) {
  return request("/user/change-email/verify", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ otp }),
  });
}


// PASSWORD
export async function changePassword(token, { oldPassword, newPassword }) {
  return request("/user/change-password", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}


// PRIVACY
export async function updatePrivacy(token, privacySettings) {
  return request("/user/settings/privacy", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(privacySettings),
  });
}


// NOTIFICATIONS
export async function updateNotifications(token, notificationSettings) {
  return request("/user/settings/notifications", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(notificationSettings),
  });
}

export async function getSettings(token) {
  return request("/user/settings", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function submitPushToken(token, pushToken) {
  return request('/devices/push-token', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ pushToken }),
  });
}

export async function removePushToken(token) {
  return request('/devices/push-token', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}


// LANGUAGES
export async function updateLanguage(token, languageSettings) {
  return request("/user/settings/language", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(languageSettings),
  });
}


// CARDS
export const getCards = async (token) => {
  return request('/cards', { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
};

export const addCard = async (token, payload) => {
  return request('/cards', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
};

export const updateCard = async (token, id, payload) => {
  return request(`/cards/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
};

export const setDefaultCard = async (token, id) => {
  return request(`/cards/${id}/default`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
};

export const deleteCard = async (token, id) => {
  return request(`/cards/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};


// ORDERS
export async function getOrders(token) {
  return request("/orders", { headers: { Authorization: `Bearer ${token}` } });
}

export async function cancelOrder(token, orderId) {
  return request(`/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
}


// WISHLIST
export async function getFavorites(token) {
  return request("/user/favorites", { headers: { Authorization: `Bearer ${token}` } });
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


// ADDRESSES
export async function getAddresses(token) {
  return request("/addresses", { headers: { Authorization: `Bearer ${token}` } });
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

export const setDefaultAddress = async (token, id) => {
  return request(`/addresses/${id}/default`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export async function deleteAddress(token, id) {
  return request(`/addresses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}


// SECURITY
export const getSecurity = (token) => {
  return request('/user/security', { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
};

export const toggle2FA = (token, data) => {
  return request('/user/security/2fa', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const get2FA = (token) => {
  return request('/user/security/2fa', { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
};

export const getLoginDevices = (token) => {
  return request('/user/security/devices', { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
};

export const removeDevice = (token, id) => {
  return request(`/user/security/devices/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const logoutAllDevices = (token) => {
  return request('/user/security/devices', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getConnectedAccount = (token, data) => {
  return request('/connected-accounts', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
};

export const toggleConnectedAccount = (token, data) => {
  return request('/connected-accounts', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
};


// CONTACT SUPPORT
export const contactSupport = async (token, { subject, orderNumber, message, image }) => {
  const formData = new FormData();
  formData.append("subject",     subject);
  formData.append("orderNumber", orderNumber || "");
  formData.append("message",     message);
  if (image) {
    formData.append("attachment", { uri: image, type: "image/jpeg", name: "support.jpg" });
  }

  const data = await uploadFormData("/support/contact", token, formData);
  return { ticketId: data.ticketId, status: data.status, createdAt: data.createdAt };
};


// FAQ
export const getFaqs = (token) => {
  return request("/faqs", { method: "GET", headers: { Authorization: `Bearer ${token}` } });
};


// MARKETPLACE LISTING
export async function getAllListings(query = {}) {
  const params = new URLSearchParams();
  if (query.category && query.category !== 'All') params.append('category', query.category);
  if (query.search) params.append('search', query.search);
  const queryString = params.toString();
  const res = await request(`/listings${queryString ? `?${queryString}` : ''}`);
  return res.listings;
}

export async function getListingById(id) {
  return request(`/listings/${id}`);
}

// FormData upload — raw fetch via uploadFormData, NOT request()
export async function createListing(token, formData) {
  return uploadFormData('/listings', token, formData);
}

export async function updateListing(token, id, listingData) {
  return request(`/listings/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(listingData),
  });
}

export async function deleteListing(token, id) {
  return request(`/listings/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}


// WARDROBE
export async function getWardrobeItems(token, category, search = '') {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  const query = params.toString();
  return request(`/wardrobe${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getWardrobeStats(token) {
  return request('/wardrobe/stats', { headers: { Authorization: `Bearer ${token}` } });
}

export async function toggleWardrobeFavorite(token, id) {
  return request(`/wardrobe/${id}/favorite`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// FormData upload — raw fetch via uploadFormData, NOT request()
export async function createWardrobeItem(token, formData) {
  return uploadFormData('/wardrobe', token, formData);
}

export async function deleteWardrobeItem(token, id) {
  return request(`/wardrobe/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}


// AUCTION
export async function getAllAuctions(query = {}) {
  const params = new URLSearchParams();
  if (query.category && query.category !== 'All') params.append('category', query.category);
  if (query.endingSoon) params.append('endingSoon', 'true');
  const queryString = params.toString();
  return request(`/auctions${queryString ? `?${queryString}` : ''}`);
}

export async function getAuctionById(id) {
  return request(`/auctions/${id}`);
}

export async function placeBid(token, auctionId, amount) {
  return request(`/auctions/${auctionId}/bid`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount }),
  });
}

// FormData upload — raw fetch via uploadFormData, NOT request()
export async function createAuction(token, formData) {
  return uploadFormData('/auctions', token, formData);
}


// SAVED ITEMS
export async function getSaved(token, itemType) {
  const query = itemType && itemType !== 'all' ? `?itemType=${itemType}` : '';
  return request(`/saved${query}`, { headers: { Authorization: `Bearer ${token}` } });
}

export async function saveNewItem(token, itemId, itemType) {
  return request('/saved', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ itemId, itemType }),
  });
}

export async function removeSaved(token, itemId) {
  return request(`/saved/${itemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function checkIsSaved(token, itemId) {
  return request(`/saved/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });
}


// FASH COLLECTION
export async function getCollectionItems(query = {}) {
  const params = new URLSearchParams();
  if (query.category && query.category !== 'All') params.append('category', query.category);
  if (query.search) params.append('search', query.search);
  if (query.brand)  params.append('brand',  query.brand);
  const queryString = params.toString();
  return request(`/collection${queryString ? `?${queryString}` : ''}`);
}

export async function getCollectionItemById(id) {
  return request(`/collection/${id}`);
}

export async function rentCollectionItem(token, id, rentalData) {
  return request(`/collection/${id}/rent`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(rentalData),
  });
}

export async function getMyRentals(token) {
  return request('/collection/my-rentals', { headers: { Authorization: `Bearer ${token}` } });
}

export async function cancelRental(token, rentalId) {
  return request(`/collection/my-rentals/${rentalId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
}


// DONATIONS
export async function getNearbyCenters(lat, lng) {
  return request(`/donations/centers?lat=${lat}&lng=${lng}&maxDistanceKm=99999`);
}

export async function createDonation(token, donationCenterId, donationItems) {
  return request('/donations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      donationCenterId,
      items: donationItems,
      itemIds: donationItems.map(i => i.wardrobeItemId),
    }),
  });
}

export async function getMyDonations(token) {
  return request('/donations/my-donations', { headers: { Authorization: `Bearer ${token}` } });
}

export async function getPointsGuide() {
  return request('/donations/points-guide');
}


// PACKING
export async function getBuilderItems(token, query = {}) {
  const params = new URLSearchParams();
  if (query.category && query.category !== 'All') params.append('category', query.category);
  if (query.source) params.append('source', query.source);
  if (query.search) params.append('search', query.search);
  const queryString = params.toString();
  return request(`/outfits/builder${queryString ? `?${queryString}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getOutfits(token) {
  return request('/outfits', { headers: { Authorization: `Bearer ${token}` } });
}

export async function getOutfitById(token, id) {
  return request(`/outfits/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}

export async function createOutfit(token, outfitData) {
  return request('/outfits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(outfitData),
  });
}

export async function updateOutfit(token, id, outfitData) {
  return request(`/outfits/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(outfitData),
  });
}

export async function deleteOutfit(token, id) {
  return request(`/outfits/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}


// CART
export async function getCart(token) {
  return request('/cart', { headers: { Authorization: `Bearer ${token}` } });
}

export async function addToCartAPI(token, itemId, itemType, options = {}) {
  return request('/cart/items', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ itemId, itemType, ...options }),
  });
}

export async function removeFromCartAPI(token, cartItemId) {
  return request(`/cart/items/${cartItemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function clearCartAPI(token) {
  return request('/cart', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}


// CHECKOUT / PAYMENT
export async function initiateCheckout(token) {
  return request('/checkout/initiate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function placeOrderCOD(token, address) {
  return request('/checkout/cod', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ address }),
  });
}


// AI STYLING
export async function chatWithAIStylist(token, message, history = []) {
  return request('/ai-stylist/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message, history }),
  });
}


// SELLER PROFILE
export async function getSellerProfile(token, sellerId) {
  return request(`/sellers/${sellerId}`, { headers: { Authorization: `Bearer ${token}` } });
}

export async function toggleFollowSeller(token, sellerId) {
  return request(`/sellers/${sellerId}/follow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getSellerReviews(token, sellerId, page = 1, limit = 10) {
  return request(`/sellers/${sellerId}/reviews?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createSellerReview(token, sellerId, reviewData) {
  return request(`/sellers/${sellerId}/reviews`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(reviewData),
  });
}

export async function getUserById(token, userId) {
  return request(`/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// SELLING TAB IN ORDERS
export async function getSales(token) {
  return request('/orders/sales', { headers: { Authorization: `Bearer ${token}` } });
}


// SELLER PICKUP INFORMATION
export async function submitPickupDetails(token, orderId, payload) {
  return request(`/orders/${orderId}/pickup`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}