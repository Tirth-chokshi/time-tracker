# Google Authentication Setup for Time Tracker

This document provides step-by-step instructions to set up Google OAuth authentication for the Time Tracker application.

## Prerequisites

1. A Google Cloud Console account
2. Next.js application with NextAuth.js installed

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" and then "New Project"
3. Name your project (e.g., "Time Tracker")
4. Click "Create"

### 1.2 Enable Google+ API
1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google+ API" and click "Enable"

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type and click "Create"
3. Fill in the required information:
   - App name: "Time Tracker"
   - User support email: Your email
   - Developer contact email: Your email
4. Click "Save and Continue"
5. Skip the Scopes section for now
6. Add test users if needed (your email)
7. Click "Save and Continue"

### 1.4 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Name it "Time Tracker Web Client"
5. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
6. Click "Create"
7. Copy the Client ID and Client Secret

## Step 2: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Generate NEXTAUTH_SECRET
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## Step 3: Update Production Settings

For production deployment:

1. Update `NEXTAUTH_URL` to your production domain
2. Add your production domain to Google OAuth authorized redirect URIs
3. Ensure all environment variables are set in your hosting platform

## Step 4: Test the Authentication

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/signin`
3. Click "Continue with Google"
4. Complete the OAuth flow
5. You should be redirected back to your application

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**: 
   - Check that your redirect URI in Google Console matches exactly with your environment

2. **"access_denied" error**: 
   - Ensure your OAuth consent screen is properly configured
   - Check if you need to add test users

3. **"invalid_client" error**: 
   - Verify your Client ID and Client Secret are correct
   - Check that the OAuth 2.0 credentials are enabled

## Security Best Practices

1. Never commit `.env.local` to version control
2. Use different OAuth clients for development and production
3. Regularly rotate your NEXTAUTH_SECRET
4. Monitor your Google Cloud Console for any suspicious activity
5. Set up proper CORS policies for production

## File Structure

The authentication setup includes:

- `/src/app/api/auth/[...nextauth]/route.js` - NextAuth configuration
- `/src/components/AuthProvider.js` - Session provider wrapper
- `/src/app/auth/signin/page.js` - Custom signin page
- `/src/app/layout.js` - Root layout with AuthProvider

## Next Steps

After setting up authentication, you can:

1. Protect routes using NextAuth middleware
2. Access user session in components with `useSession()`
3. Implement role-based access control
4. Add user profile management
5. Integrate with your time tracking features