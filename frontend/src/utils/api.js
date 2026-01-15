import axios from "axios";
import { getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const BASE_URL = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://free-finder-c3h3bvb6g6emdbej.westus3-01.azurewebsites.net";

const store = getDefaultStore();
export const INVALID_TOKEN = "INVALID_TOKEN";
export const tokenAtom = atomWithStorage("token", INVALID_TOKEN, undefined, {
  getOnInit: true,
});
// accessible in react components with useAtom(tokenAtom)
// accessible elsewhere with store.get(tokenAtom)

export const expirationAtom = atomWithStorage(
  "expiration",
  Date.now(),
  undefined,
  {
    getOnInit: true,
  },
);
const EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 hours

export function signout() {
  store.set(tokenAtom, INVALID_TOKEN);
}

/**
 * @typedef {Object} Listing
 * @property {string} _id
 * @property {string} email
 * @property {string} title
 * @property {string} description
 * @property {string} location
 * @property {string} category
 * @property {string} fileUrl
 * @property {string} created_at
 * @property {boolean} available
 * @property {string} isAuthor
 */

/**
 * Fetches listing with given id
 * @param {string} id
 * @returns {Promise<Listing?>} Listing with given id
 */
export async function fetchListing(id) {
  try {
    const response = await axios.get(`${BASE_URL}/listing/${id}`, {
      headers: addAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Fetches all listings from the backend
 * @param {Object} [options]
 * @param {string} [options.keyword]
 * @param {string} [options.category]
 * @returns {Promise<Listing[]?>} All listings
 */
export async function fetchListings({ keyword, category } = {}) {
  try {
    const url = new URL(`${BASE_URL}/listings`);

    if (keyword) {
      url.searchParams.set("keyword", keyword);
    }

    if (category) {
      url.searchParams.set("category", category);
    }

    const response = await axios.get(url.toString());

    return response.data.listings;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Posts a new listing to the backend
 * @param {string} title
 * @param {string} description
 * @param {string} location
 * @param {string} category
 * @param {string} fileUrl
 * @returns {Promise<Listing?>} Posted listing
 */
export async function postListing(
  title,
  description,
  location,
  category,
  fileUrl,
) {
  try {
    const response = await axios.post(
      `${BASE_URL}/listing`,
      {
        title,
        description,
        location,
        category,
        fileUrl,
      },
      {
        headers: addAuthHeader(),
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Posts a new listing to the backend
 *
 * @param {string} title
 * @param {string} description
 * @param {string} location
 * @param {string} category
 * @param {string} fileUrl
 * @returns {Promise<Listing?>} Posted listing
 */

/**
 * Updates a listing in the backend
 * @param {Partial<Listing>} listing
 * @returns {Promise<Listing?>} Updated listing
 */
export async function updateListing(listing) {
  try {
    const response = await axios.patch(
      `${BASE_URL}/listing/${listing._id}`,
      listing,
      {
        headers: addAuthHeader(),
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {number} phone
 * @property {Listing[]} listings
 */

/**
 * @param {string} email
 * @returns {Promise<User?>} All listings

 */
export async function fetchUser(email) {
  try {
    const response = await axios.get(`${BASE_URL}/user/${email}`, {
      headers: addAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * @typedef {Object} Creds
 * @property {string} email
 * @property {string} password
 */

/**
 * @param {Creds} creds
 * @returns {Promise<boolean>} Whether the login was successful
 */
export async function loginUser({ email, password }) {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      email: email,
      password: password,
    });
    const token = response.data.token;
    store.set(tokenAtom, token);
    store.set(expirationAtom, Date.now() + EXPIRATION_TIME);
    return true;
  } catch (error) {
    console.log(error);
    store.set(tokenAtom, INVALID_TOKEN);
    return false;
  }
}

/**
 * @typedef {Object} SignUpCreds
 * @property {string} email
 * @property {string} password
 * @property {string} name
 * @property {string} phone
 */

/**
 * Sends the verification email to the user
 * @param {SignUpCreds} creds
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>} Success state of sign up
 */
export async function signUpUser(creds) {
  try {
    const response = await axios.post(`${BASE_URL}/signup`, creds);
    return { success: true, message: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data };
  }
}

/**
 * verifies the users email and creates user in db before sending auth token
 * @param {Token} token // the email verification token
 * @returns {Promise<{ success: boolean, error: string? }>} Success state of sign up
 */
export async function createUser(token) {
  try {
    const response = await axios.post(`${BASE_URL}/create-user?token=${token}`);
    const authToken = response.data.token;
    store.set(tokenAtom, authToken);
    store.set(expirationAtom, Date.now() + EXPIRATION_TIME);
    return { success: true };
  } catch (error) {
    console.log(error);
    store.set(tokenAtom, INVALID_TOKEN);
    return { success: false, error: error?.response?.data };
  }
}

export function addAuthHeader(otherHeaders = {}) {
  const token = store.get(tokenAtom);
  if (token === INVALID_TOKEN) {
    return otherHeaders;
  } else {
    return {
      ...otherHeaders,
      Authorization: `Bearer ${token}`,
    };
  }
}

/**
 * Fetches the currently authenticated user's info from the session API using the token.
 * @returns {Promise<User|null>} A promise that resolves to the user's email if successful, or `null` if an error occurs.
 */
export async function fetchUserInfo() {
  try {
    const response = await axios.get(`${BASE_URL}/user/me`, {
      headers: addAuthHeader(),
    });

    const data = response.data;
    return data; // the user info returned
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

/**
 * Fetches full user information based on the provided email.
 * @param {string} email
 * @returns {Promise<User|null>}
 *
 */
export async function fetchUserUsingEmail(email) {
  try {
    const response = await axios.get(`${BASE_URL}/user/${email}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user using email:", error);
    return null;
  }
}

/**
 * Tries to update user name
 * @param {string} newName
 * @returns {Promise<User|null>} A promise that resolves to the user name if successful, or `null` if an error occurs.
 */
export async function updateUserName(newName) {
  try {
    // pass new name into request body
    const response = await axios.post(
      `${BASE_URL}/user/update-name`,
      { newName },
      { headers: addAuthHeader() },
    );
    return response;
  } catch (error) {
    console.log(error);
    throw new Error("An unknown error occurred while updating name.");
  }
}

/**
 * Tries to update pfp
 * @param {string} newLink
 * @returns {Promise<User|null>} A promise that resolves to the user name if successful, or `null` if an error occurs.
 */
export async function updateUserProfilePicture(newLink) {
  try {
    // pass new name into request body
    const response = await axios.post(
      `${BASE_URL}/user/update-pfp`,
      { newLink },
      { headers: addAuthHeader() },
    );
    return response;
  } catch (error) {
    console.log(error);
    throw new Error("An unknown error occurred while updating pfp");
  }
}

/**
 * Tries to update user email
 * @param {string} newEmail
 * @returns {Promise<User|null>} A promise that resolves to the user's email if successful, or `null` if an error occurs.
 */
/*
export async function updateUserEmail(newEmail) {
  try {
    const response = await axios.post(
      `${BASE_URL}/user/update-email`,
      { newEmail },
      { headers: addAuthHeader() },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.data);
  }
}
*/

/**
 * Tries to update user phone number
 * @param {string} newPhone
 * @returns {Promise<User|null>} A promise that resolves to the user's phone number if successful, or `null` if an error occurs.
 */
export async function updateUserPhone(newPhone) {
  try {
    const response = await axios.post(
      `${BASE_URL}/user/update-phone`,
      { newPhone },
      { headers: addAuthHeader() },
    );
    return response;
  } catch (error) {
    console.log(error);
    throw new Error("An unknown error occurred while updating phone number.");
  }
}

/**
 * Tries to update user password
 * @param {string} password
 * @param {string} newPassword
 * @returns {Promise<User|null>} A promise that resolves to the user's password if successful, or `null` if an error occurs.
 */
export async function updateUserPassword(password, newPassword) {
  try {
    const response = await axios.post(
      `${BASE_URL}/user/update-password`,
      { password, newPassword },
      { headers: addAuthHeader() },
    );
    return response;
  } catch (error) {
    throw new Error(
      "An unknown error occurred while updating password" + error,
    );
  }
}

/**
 * @typedef {Object} Review
 * @property {string} _id
 * @property {string} email
 * @property {string} reviewer_email
 * @property {number} rating
 * @property {string} description
 * @property {string} created_at
 */

/**
 * Posts a new review to the backend
 * @param {string} email
 * @param {number} rating
 * @param {string} description
 * @returns {Promise<{
 *  success: boolean,
 *  data: Review | null,
 *  error: string | null
 * }>} Posted listing
 */
export async function postReview(email, rating, description) {
  try {
    const response = await axios.post(
      `${BASE_URL}/review`,
      {
        email,
        rating,
        description,
      },
      {
        headers: addAuthHeader(),
      },
    );
    return { success: true, data: response.data, error: null };
  } catch (error) {
    console.log("Error posting review:", error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || "Failed to post review",
    };
  }
}

/**
 * Fetches all reviews and the average rating for a user
 * @param {string} email - Email of the user whose reviews are being fetched
 * @returns {Promise<{ success: boolean, data: { reviews: any[], rating: number }, error: string | null }>}
 */
export async function fetchReviews(email) {
  try {
    const response = await axios.get(`${BASE_URL}/reviews/${email}`, {
      headers: addAuthHeader(), // Include authentication token if required
    });

    // Return success and the reviews/rating data
    return { success: true, data: response.data, error: null };
  } catch (error) {
    console.error("Error fetching reviews:", error);

    // Return error details
    return {
      success: false,
      data: { reviews: [], rating: 0 },
      error: error.response?.data?.message || "Failed to fetch reviews",
    };
  }
}
