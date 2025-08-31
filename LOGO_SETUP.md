# Logo Setup Guide

## Overview
The Xpenses application has been updated to use a PNG logo instead of text-based branding. All components have been modified to display the logo image.

## Logo Requirements

### File Location
The logo SVG file is located at: `public/logo.svg`

### Current Logo Design
- **Format**: SVG with black background
- **Size**: 192x192px
- **Design**: "Xpense" in light gray (#A0A0A0) with "Tracker" in darker gray (#606060) below
- **Background**: Black (#000000)
- **Style**: Professional financial application branding

### Design Suggestions
- Use a simple icon or symbol that represents finance/money management
- Consider using blue tones to match the app's color scheme
- Ensure the logo is readable at small sizes (32px height in headers)
- Test the logo on both white and colored backgrounds

## Updated Components

The following components have been updated to use the PNG logo:

1. **Header Component** (`src/components/common/header_component.js`)
   - Logo displayed in center of header
   - Size: 32px height

2. **Home View** (`src/components/views/home_view.js`)
   - Logo displayed on left side of mobile header
   - Size: 32px height

3. **Transactions View** (`src/components/views/transactions_view.js`)
   - Logo displayed on left side of mobile header
   - Size: 32px height

4. **Stats View** (`src/components/views/stats_view.js`)
   - Logo displayed on left side of mobile header
   - Size: 32px height

5. **Advisor View** (`src/components/views/advisor_view.js`)
   - Logo displayed on left side of mobile header
   - Size: 32px height

6. **Login Screen** (`src/components/auth/login_screen.js`)
   - Logo displayed prominently in center
   - Size: 80px height

## Configuration Files Updated

- `public/manifest.json` - Added logo.png to app icons
- `public/index.html` - Updated apple-touch-icon reference

## Implementation Details

The logo is implemented using standard HTML `<img>` tags with the following CSS classes:
- `h-8 w-auto object-contain` for header logos (32px height)
- `h-20 w-auto object-contain` for login screen logo (80px height)

The `object-contain` class ensures the logo maintains its aspect ratio and fits within the specified dimensions.

## Current Status

✅ **Logo Implementation Complete**
- SVG logo created based on your provided image
- All components updated to use the logo
- Configuration files updated
- Logo displays consistently across all views

## Logo Features

- **Scalable**: SVG format ensures crisp display at any size
- **Professional**: Black background with gray text matches your design
- **Consistent**: Same logo appears in all components
- **Responsive**: Automatically scales to fit different screen sizes
