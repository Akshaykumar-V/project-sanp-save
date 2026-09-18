# Render Deployment Guide for SnapSave Backend

## Prerequisites
Before deploying, make sure you have:
- ✅ A GitHub account
- ✅ Your code pushed to a GitHub repository
- ✅ A Render account (sign up at https://render.com)
- ✅ A MongoDB Atlas database URL
- ✅ Your GROQ API key

## Environment Variables You'll Need
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string for JWT tokens
- `GROQ_API_KEY` - Your Groq API key for AI features
- `FRONTEND_URL` - Your frontend URL (from Vercel deployment)

## Deployment Steps

### Step 1: Push Your Code to GitHub
```bash
# If not already done
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### Step 2: Sign Up / Log In to Render
1. Go to https://render.com
2. Sign up with GitHub (recommended) or email
3. Authorize Render to access your repositories

### Step 3: Create a New Web Service
1. Click "New +" button in the Render dashboard
2. Select "Web Service"
3. Connect your GitHub repository
4. Select the repository containing your backend code

### Step 4: Configure Your Service
Fill in these settings:
- **Name**: `snapsave-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., Oregon)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend` ⚠️ IMPORTANT
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free` (for testing)

### Step 5: Add Environment Variables
Click "Advanced" and add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| NODE_ENV | `production` | Sets production mode |
| MONGODB_URI | `your_mongodb_uri` | From MongoDB Atlas |
| JWT_SECRET | `generate_random_string` | Use a secure random string |
| JWT_EXPIRE | `7d` | Token expiration time |
| GROQ_API_KEY | `your_groq_api_key` | Your Groq API key |
| FRONTEND_URL | `your_vercel_url` | Your frontend URL from Vercel |

**Note**: Render automatically sets the `PORT` environment variable.

### Step 6: Deploy
1. Click "Create Web Service"
2. Render will start building and deploying your application
3. Wait for deployment to complete (usually 2-5 minutes)
4. Copy your backend URL (e.g., `https://snapsave-backend.onrender.com`)

### Step 7: Update Frontend Configuration
Update your frontend's API URL to point to your Render backend:
```javascript
// In your frontend .env or api.js
VITE_API_URL=https://your-backend-url.onrender.com
```

### Step 8: Test Your Deployment
Test these endpoints:
- `GET https://your-backend-url.onrender.com/` - Should show API info
- `GET https://your-backend-url.onrender.com/health` - Should show health status

## Important Notes

### Free Tier Limitations
⚠️ Render's free tier has some limitations:
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- 750 hours/month of runtime

### MongoDB Atlas Configuration
Make sure your MongoDB Atlas:
1. Allows connections from anywhere (0.0.0.0/0) or add Render's IP
2. Has a database user with read/write permissions

### CORS Configuration
Your backend already has CORS configured to accept:
- Your local frontend (http://localhost:5173)
- All Vercel preview URLs (*.vercel.app)
- Custom FRONTEND_URL from environment variable

## Troubleshooting

### Build Fails
- Check that `Root Directory` is set to `backend`
- Verify `package.json` exists in backend folder
- Check build logs for specific errors

### Database Connection Errors
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access settings
- Ensure database user credentials are correct

### App Crashes on Start
- Check environment variables are set correctly
- View logs in Render dashboard
- Ensure all required dependencies are in package.json

### Timeout Errors
- Free tier spins down - first request takes longer
- Consider upgrading to paid tier for always-on service

## After Deployment

### Monitor Your Service
- Check logs in Render dashboard
- Set up alerts for errors
- Monitor usage in Render metrics

### Keep Backend URL
Save your backend URL and update it in:
- Frontend environment variables
- API documentation
- README files

## Support
If you encounter issues:
- Check Render documentation: https://render.com/docs
- View application logs in Render dashboard
- Check MongoDB Atlas logs for connection issues
