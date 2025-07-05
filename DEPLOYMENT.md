# Deployment Guide for Abraham Restaurant Botpress Integration

## Current Status ✅
Your local integration is working perfectly! Here's what's set up:

### Backend Endpoints:
- ✅ http://localhost:8080/api/botpress-reservations
- ✅ http://localhost:8080/api/botpress/webhook  
- ✅ Database tables created and working
- ✅ Integration tested successfully

### Frontend:
- ✅ Chatbot embedded in React app
- ✅ Scripts loaded from Botpress Cloud

## For Production Deployment:

### 1. Deploy Backend to Cloud
Choose one of these platforms:

**Heroku:**
```bash
# Install Heroku CLI, then:
heroku create abraham-restaurant-api
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
heroku config:set DB_USER=your-db-user
heroku config:set DB_PASSWORD=your-db-password
heroku config:set DB_NAME=abraham_restaurant
heroku config:set JWT_SECRET_KEY=your-secret-key
git push heroku main
```

**Railway:**
```bash
# Install Railway CLI, then:
railway login
railway init
railway add mysql
railway deploy
```

**DigitalOcean App Platform:**
- Connect your GitHub repo
- Set environment variables in dashboard
- Deploy automatically

### 2. Update Botpress Studio Action
In your Botpress Studio action, change:
```javascript
// From:
const API_URL = 'http://localhost:8080/api/botpress-reservations';

// To:
const API_URL = 'https://your-production-domain.com/api/botpress-reservations';
```

### 3. Database Setup
Make sure your production database has:
- ✅ reservations table
- ✅ botpress_reservations table  
- ✅ All required columns including review columns

### 4. Test Production
```bash
# Test your production API
curl -X POST https://your-production-domain.com/api/botpress-reservations \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "email": "test@example.com", 
    "phone": "555-0123",
    "date": "2024-12-25",
    "time": "19:30",
    "partySize": 4,
    "specialRequests": "Test reservation"
  }'
```

## Security Checklist:
- [ ] Use HTTPS in production
- [ ] Set proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable database SSL
- [ ] Set up monitoring/logging

## Monitoring:
Add these to track your reservations:
- Database monitoring
- API endpoint monitoring  
- Error logging (Sentry, LogRocket, etc.)
- Reservation analytics

## Support:
If you need help with deployment:
1. Check the logs for any errors
2. Verify all environment variables are set
3. Test database connectivity
4. Ensure Botpress can reach your API

Your integration is ready for production! 🎉
