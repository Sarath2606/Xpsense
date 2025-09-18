import React, { useState, useEffect } from 'react';
import { getGmailProfilePicture } from '../../utils/profilePicture';

/**
 * ProfilePicture component that displays user profile pictures
 * Falls back to initials if no picture is available
 */
const ProfilePicture = ({ 
  email, 
  name, 
  size = 'md', 
  className = '', 
  showBorder = false,
  isAdmin = false 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Get profile picture URL
  const profilePicUrl = getGmailProfilePicture(email);
  
  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };
  
  // Get display name and initial
  const displayName = name || email || 'Unknown';
  const initial = displayName.charAt(0).toUpperCase();
  
  // Admin styling
  const adminClasses = isAdmin 
    ? 'bg-purple-600' 
    : 'bg-gray-600';
  
  // Border classes
  const borderClasses = showBorder 
    ? 'ring-2 ring-white shadow-lg' 
    : '';
  
  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };
  
  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };
  
  // Reset error state when email changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [email]);
  
  return (
    <div className={`${sizeClasses[size]} ${borderClasses} ${className} relative`}>
      {profilePicUrl && !imageError ? (
        <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
          <img
            src={profilePicUrl}
            alt={`${displayName}'s profile`}
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
          {!imageLoaded && (
            <div className={`w-full h-full rounded-full flex items-center justify-center ${adminClasses}`}>
              <span className="text-white font-medium">
                {initial}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className={`w-full h-full rounded-full flex items-center justify-center ${adminClasses}`}>
          <span className="text-white font-medium">
            {initial}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
