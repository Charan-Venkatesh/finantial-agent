# Complete Setup Guide

This guide will walk you through setting up the Financial AI Agent Platform from scratch.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Python 3.11 or higher installed
- [ ] MySQL 8.0 or higher installed and running
- [ ] Docker and Docker Compose installed (for containerized setup)
- [ ] Git installed
- [ ] Text editor or IDE (VS Code recommended)

### API Keys Required

- [ ] Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))
- [ ] Market data provider API key (choose one):
  - Alpaca Markets ([Sign up](https://alpaca.markets/))
  - Polygon.io ([Sign up](https://polygon.io/))
  - Finnhub ([Sign up](https://finnhub.io/))
- [ ] News API key ([Get it here](https://newsapi.org/))

## 🚀 Method 1: Docker Setup (Recommended)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd financial_ai_agent
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your API keys:

```bash
# Database Configuration
DATABASE_URL=mysql+aiomysql://finagent:finagentpass@mysql:3306/financial_agent_db
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_USER=finagent
MYSQL_PASSWORD=finagentpass

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# Market Data Provider
MARKET_DATA_PROVIDER=alpaca
MARKET_DATA_API_KEY=your-alpaca-key-here
MARKET_DATA_SECRET_KEY=your-alpaca-secret-here

# News API
NEWS_API_KEY=your-news-api-key-here
```

### Step 3: Build and Start Services

```bash
docker-compose up -d
```

This will start:
- Backend API (port 8000)
- React frontend (port 3000)

### Step 4: Verify Services

Check that all services are running:

```bash
docker-compose ps
```

You should see two services: `backend` and `frontend-react`.

### Step 5: Access the Application

- **Frontend**: Open http://localhost:3000 in your browser
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Step 6: Create Your First Account

1. Go to http://localhost:3000
2. Click on "Sign Up" tab
3. Fill in your details
4. Click "Sign Up"
5. Switch to "Login" tab and log in

**Congratulations! Your system is ready.**

---

## 🛠️ Method 2: Manual Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd financial_ai_agent
```

### Step 2: Setup MySQL Database

#### On Mac (using Homebrew):
```bash
brew install mysql
brew services start mysql
mysql -u root -p
```

#### On Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
sudo mysql -u root -p
```

#### On Windows:
Download and install MySQL from [mysql.com](https://dev.mysql.com/downloads/installer/)

#### Create Database:
```sql
mysql -u root -p < DATABASE_SCHEMA.sql
```

Or manually:
```sql
CREATE DATABASE financial_agent_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run the schema:
```bash
mysql -u root -p financial_agent_db < DATABASE_SCHEMA.sql
```

### Step 3: Setup Backend

```bash
cd backend
```

#### Create Virtual Environment:

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

#### Install Dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Configure Environment:
```bash
cd ..
cp .env.example .env
```

Edit `.env` with your local database connection:

```bash
DATABASE_URL=mysql+aiomysql://root:yourpassword@localhost:3306/financial_agent_db
SECRET_KEY=your-secret-key-min-32-characters-long
GEMINI_API_KEY=your-gemini-key
MARKET_DATA_API_KEY=your-market-data-key
MARKET_DATA_SECRET_KEY=your-market-data-secret
NEWS_API_KEY=your-news-api-key
```

#### Run Backend:
```bash
cd backend
uvicorn app.main:app --reload
```

Backend should now be running at http://localhost:8000

### Step 4: Setup Frontend

Open a **new terminal window**:

```bash
cd react-frontend
```

#### Install Dependencies:
```bash
npm install
```

#### Run Frontend:
```bash
npm run dev
```

Frontend should be available at http://localhost:5173

### Step 5: Verify Setup

1. **Check Backend Health**: Visit http://localhost:8000/health
2. **Check API Docs**: Visit http://localhost:8000/docs
3. **Check Frontend**: Visit http://localhost:5173

---

## 🔧 API Key Setup Guides

### Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Paste it in `.env` as `GEMINI_API_KEY`

### Alpaca Markets (Recommended for beginners)

1. Go to [Alpaca Markets](https://alpaca.markets/)
2. Sign up for a free account
3. Navigate to "Paper Trading" → "API Keys"
4. Generate new API key
5. Copy both Key ID and Secret Key
6. In `.env`:
   - Set `MARKET_DATA_PROVIDER=alpaca`
   - Set `MARKET_DATA_API_KEY=<your-key-id>`
   - Set `MARKET_DATA_SECRET_KEY=<your-secret-key>`

### News API

1. Go to [NewsAPI.org](https://newsapi.org/)
2. Click "Get API Key"
3. Sign up for free account
4. Copy your API key
5. Paste it in `.env` as `NEWS_API_KEY`

---

## ✅ Post-Setup Verification

### Test Backend API

```bash
# Health check
curl http://localhost:8000/health

# Should return:
# {"status":"healthy","database":"connected","ai_agents":"operational","market_data":"streaming"}
```

### Test User Registration

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123",
    "full_name": "Test User"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

Should return a JWT token.

---

## 🐛 Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Verify MySQL is running: `mysql -u root -p`
2. Check DATABASE_URL in `.env`
3. Ensure database exists: `SHOW DATABASES;`
4. Check user permissions

### Issue: "Import error: No module named 'fastapi'"

**Solution:**
1. Ensure virtual environment is activated
2. Run `pip install -r requirements.txt`
3. Verify Python version: `python --version` (should be 3.11+)

### Issue: "Gemini API authentication failed"

**Solution:**
1. Verify API key is correct
2. Check key has not expired
3. Ensure no extra spaces in .env file
4. Test key at [AI Studio](https://makersuite.google.com/)

### Issue: "Port already in use"

**Solution:**

**Mac/Linux:**
```bash
# Find process using port 8000
lsof -i :8000
# Kill the process
kill -9 <PID>
```

**Windows:**
```bash
# Find process
netstat -ano | findstr :8000
# Kill process
taskkill /PID <PID> /F
```

### Issue: "WebSocket connection failed"

**Solution:**
1. Ensure backend is running
2. Check firewall settings
3. Verify CORS configuration
4. Check browser console for errors

### Issue: Docker containers won't start

**Solution:**
1. Check Docker is running: `docker ps`
2. View logs: `docker-compose logs`
3. Rebuild containers: `docker-compose down && docker-compose up --build -d`
4. Check port conflicts: `docker-compose ps`

---

## 🔒 Security Hardening (Production)

### Before deploying to production:

1. **Change SECRET_KEY**: Generate a strong random key
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Use HTTPS**: Set up SSL/TLS certificates

3. **Secure Database**:
   - Change default passwords
   - Use strong passwords
   - Restrict network access
   - Enable SSL connections

4. **Environment Variables**: Use secret management service (AWS Secrets Manager, HashiCorp Vault, etc.)

5. **Rate Limiting**: Implement API rate limiting

6. **Monitoring**: Set up logging and monitoring

7. **Backups**: Configure automated database backups

---

## 📚 Next Steps

After successful setup:

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Read Architecture**: See `ARCHITECTURE.md`
3. **Try the Frontend**: Create watchlists, run AI analyses
4. **Check Logs**: Monitor backend output for errors
5. **Customize**: Modify agents, add features

---

## 🆘 Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Review logs: `docker-compose logs` or check terminal output
3. Search GitHub issues
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Logs

---

**Setup Complete! Start building your financial intelligence platform.**
