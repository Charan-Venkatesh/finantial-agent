# React Frontend Setup and Usage Guide

## ✅ Complete React.js Frontend Implementation

This project now includes a **complete, professional React.js frontend** with modern UI/UX design and full backend integration.

## 🎨 Features

### Authentication
- ✅ Professional login page with validation
- ✅ User registration with comprehensive form validation
- ✅ JWT token-based authentication
- ✅ Protected routes with automatic redirect
- ✅ Secure token management

### Dashboard
- ✅ Real-time stock price monitoring
- ✅ Auto-refresh functionality (30-second intervals)
- ✅ Multi-ticker tracking
- ✅ Market status indicator
- ✅ Color-coded price changes (green/red)
- ✅ Volume and price change percentage

### News
- ✅ Financial news aggregation
- ✅ Category-based filtering (Business, Technology)
- ✅ Search functionality
- ✅ Topic-based browsing (Stocks, Crypto, Forex, etc.)
- ✅ Clean, readable article cards

### AI Insights
- ✅ Multi-agent AI analysis
- ✅ Four query types:
  - Decision Synthesis (comprehensive analysis)
  - Market Analysis (technical analysis)
  - News Sentiment (sentiment evaluation)
  - Risk Assessment (risk analysis)
- ✅ Detailed agent insights with confidence scores
- ✅ Risk level indicators (Low/Medium/High)
- ✅ Execution time tracking

### Watchlist
- ✅ Personal stock tracking
- ✅ Add/remove stocks
- ✅ Custom notes for each stock
- ✅ Alert thresholds

### Query History
- ✅ Review past AI analyses
- ✅ Detailed query information
- ✅ Modal view for full results

## 🚀 Quick Start

### Option 1: Development Mode

```bash
# Navigate to React frontend directory
cd react-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Access at: **http://localhost:5173**

### Option 2: Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Option 3: Docker Deployment

```bash
# From project root
docker-compose up -d

# Access services:
# - React Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - Streamlit Frontend (legacy): http://localhost:8501
```

## 📦 Tech Stack

- **React 18** - Modern React with hooks
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Tailwind CSS v4** - Modern utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Date-fns** - Date formatting and manipulation

## 🏗️ Architecture

### Service Layer Pattern
All API calls are centralized in service files:
- `authService.js` - Authentication (login, signup, getCurrentUser)
- `marketService.js` - Stock market data and watchlist
- `newsService.js` - Financial news aggregation
- `insightsService.js` - AI analysis and history

### State Management
- **AuthContext** - Global authentication state using React Context API
- **Protected Routes** - Automatic redirect for unauthenticated users
- **JWT Token Management** - Automatic token injection in requests

### Component Structure
```
src/
├── components/
│   ├── layout/          # Layout components
│   │   ├── Navbar.jsx   # Navigation bar with active states
│   │   └── ProtectedRoute.jsx  # Authentication wrapper
│   └── ui/              # Reusable UI components
│       ├── Button.jsx   # Button with variants
│       ├── Card.jsx     # Card component
│       ├── Input.jsx    # Form input with validation
│       └── Loading.jsx  # Loading spinner
├── pages/               # Page components
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── News.jsx
│   ├── Insights.jsx
│   ├── Watchlist.jsx
│   └── History.jsx
├── services/            # API service layer
├── context/             # React Context
└── App.jsx              # Main app with routing
```

## 🎨 UI/UX Highlights

### Design System
- **Color Palette**: Professional blue theme with semantic colors
- **Typography**: Clean, hierarchical text styles
- **Spacing**: Consistent spacing system
- **Components**: Reusable, accessible components

### Responsive Design
- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop layouts
- ✅ Flexible grid systems

### Interactive Elements
- ✅ Smooth transitions and animations
- ✅ Loading states for async operations
- ✅ Error handling with user-friendly messages
- ✅ Form validation with real-time feedback

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `react-frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### CORS Configuration

Ensure the backend allows the React frontend origin. Update `backend/app/core/config.py`:

```python
ALLOWED_ORIGINS: list[str] = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Docker/production
    "http://localhost:8501",  # Streamlit (legacy)
]
```

## 📸 Screenshots

### Login Page
![Login Page](https://github.com/user-attachments/assets/a42adb43-07b9-4481-9335-c959bba019da)

### Signup Page
![Signup Page](https://github.com/user-attachments/assets/9db8396d-be81-4c96-ae0c-4792b3a5cebf)

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Protected routes with automatic redirect
- ✅ Secure API client with interceptors
- ✅ Token refresh handling
- ✅ XSS protection
- ✅ Password validation
- ✅ CORS protection

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Docker Deployment

The included `Dockerfile` uses a multi-stage build:
1. **Build stage**: Compiles the React app
2. **Production stage**: Serves static files with Nginx

```bash
docker build -t financial-agent-react .
docker run -p 3000:80 financial-agent-react
```

## 📚 API Integration

### Authentication Flow
1. User submits login credentials
2. Frontend sends POST request to `/api/auth/login`
3. Backend returns JWT token
4. Token stored in localStorage
5. Token automatically included in subsequent requests
6. Protected routes check authentication status

### Data Flow
1. Components call service functions
2. Services use axios client with interceptors
3. Interceptor adds JWT token to headers
4. Backend validates token and processes request
5. Response data returned to component
6. Component updates UI

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### CORS Errors
- Ensure backend CORS settings include frontend origin
- Check that backend is running on port 8000
- Verify environment variables are correct

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## 📝 Development Notes

### Code Quality
- Consistent code style with ESLint
- Component-based architecture
- Reusable utility functions
- Proper error handling

### Performance
- Code splitting with React Router
- Lazy loading of pages
- Optimized bundle size with Vite
- Efficient re-renders with React hooks

## 🎯 Next Steps

- [ ] Add real-time WebSocket support for live data
- [ ] Implement dark mode toggle
- [ ] Add data visualization charts
- [ ] Add export functionality for reports
- [ ] Implement notification system
- [ ] Add user profile management

---

**Built with ❤️ for modern financial intelligence**
