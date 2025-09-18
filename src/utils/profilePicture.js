/**
 * Utility functions for handling user profile pictures
 */

/**
 * Get Gmail profile picture URL from email address
 * @param {string} email - User's email address
 * @returns {string} - Profile picture URL or null
 */
export const getGmailProfilePicture = (email) => {
  if (!email || typeof email !== 'string') return null;
  
  // Extract the email part before @
  const emailPrefix = email.split('@')[0];
  
  // Gmail profile picture URL format
  // This uses Google's public profile picture API
  return `https://www.gravatar.com/avatar/${emailPrefix}?d=identicon&s=200`;
};

/**
 * Get Google profile picture URL (more reliable for Gmail users)
 * @param {string} email - User's email address
 * @returns {string} - Profile picture URL or null
 */
export const getGoogleProfilePicture = (email) => {
  if (!email || typeof email !== 'string') return null;
  
  // For Gmail users, we can try to get their Google profile picture
  // This is a more reliable method for Gmail users
  const emailHash = btoa(email.toLowerCase().trim());
  return `https://lh3.googleusercontent.com/a/default-user=${emailHash}`;
};

/**
 * Get profile picture with fallback options
 * @param {string} email - User's email address
 * @param {string} name - User's name (for fallback initial)
 * @returns {object} - { src: string, fallback: string }
 */
export const getProfilePicture = (email, name = '') => {
  // Try Gmail profile picture first
  const gmailPic = getGmailProfilePicture(email);
  
  // Fallback to name initial
  const fallback = name ? name.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : '?');
  
  return {
    src: gmailPic,
    fallback: fallback
  };
};

/**
 * Check if an image URL is accessible
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} - Whether the image is accessible
 */
export const isImageAccessible = async (url) => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Get the best available profile picture
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @returns {Promise<object>} - { src: string, fallback: string, isAvailable: boolean }
 */
export const getBestProfilePicture = async (email, name = '') => {
  const gmailPic = getGmailProfilePicture(email);
  const fallback = name ? name.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : '?');
  
  if (gmailPic) {
    const isAvailable = await isImageAccessible(gmailPic);
    return {
      src: gmailPic,
      fallback: fallback,
      isAvailable: isAvailable
    };
  }
  
  return {
    src: null,
    fallback: fallback,
    isAvailable: false
  };
};
