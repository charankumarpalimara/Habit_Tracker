# Habits Tracker Backend API

A robust Node.js backend API for the Habits Tracker application with user authentication, habit management, and progress tracking.

## 🚀 Features

### ✅ Core Functionality
- **User Authentication**: JWT-based authentication with registration and login
- **Habit Management**: Full CRUD operations for habits
- **Progress Tracking**: Mark habits as completed with date validation
- **Statistics & Analytics**: Comprehensive progress analytics
- **Data Validation**: Input validation and sanitization
- **Security**: Password hashing, rate limiting, and CORS protection

### ✅ Advanced Features
- **Streak Calculation**: Automatic streak tracking for habits
- **Category Management**: Organize habits by categories
- **Reminder System**: Configurable reminders for habits
- **Mood Tracking**: Track mood with habit completions
- **Progress Analytics**: Detailed statistics and insights

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, express-rate-limit
- **Logging**: morgan

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `config.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/habits-tracker

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, validated),
  password: String (required, min 6 chars, hashed),
  avatar: String (optional),
  preferences: {
    theme: String (light/dark),
    notifications: Boolean,
    timezone: String
  },
  isActive: Boolean (default: true),
  lastLogin: Date,
  timestamps: true
}
```

### Habit Model
```javascript
{
  user: ObjectId (ref: User, required),
  title: String (required, 1-100 chars),
  description: String (optional, max 500 chars),
  category: String (required, 1-50 chars),
  frequency: String (daily/weekly/monthly),
  target: Number (required, min 1),
  unit: String (required, 1-20 chars),
  color: String (hex color),
  isActive: Boolean (default: true),
  reminder: {
    enabled: Boolean,
    time: String (HH:MM),
    days: [String] (weekdays)
  },
  streak: {
    current: Number,
    longest: Number,
    lastUpdated: Date
  },
  timestamps: true
}
```

### Progress Model
```javascript
{
  user: ObjectId (ref: User, required),
  habit: ObjectId (ref: Habit, required),
  date: Date (required, no future dates),
  completed: Boolean (default: true),
  notes: String (optional, max 200 chars),
  mood: String (excellent/good/okay/bad/terrible),
  timestamps: true
}
```

## 🔌 API Endpoints

### Authentication Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user profile | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/password` | Change password | Private |

### Habit Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/habits` | Get all habits (with filters) | Private |
| GET | `/api/habits/:id` | Get single habit | Private |
| POST | `/api/habits` | Create new habit | Private |
| PUT | `/api/habits/:id` | Update habit | Private |
| DELETE | `/api/habits/:id` | Delete habit | Private |
| GET | `/api/habits/categories` | Get habit categories | Private |

### Progress Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/progress` | Get progress (with filters) | Private |
| POST | `/api/progress/:habitId` | Mark habit as completed | Private |
| DELETE | `/api/progress/:habitId/:date` | Remove completion | Private |
| GET | `/api/progress/stats` | Get statistics and analytics | Private |

## 🔐 Authentication

All private routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## 📝 API Examples

### Create a Habit
```bash
POST /api/habits
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Exercise",
  "description": "Daily workout routine",
  "category": "Health",
  "frequency": "daily",
  "target": 1,
  "unit": "session",
  "color": "#3b82f6",
  "reminder": {
    "enabled": true,
    "time": "07:00",
    "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
  }
}
```

### Mark Habit as Completed
```bash
POST /api/progress/:habitId
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "notes": "Great workout today!",
  "mood": "excellent"
}
```

### Get Habits with Filters
```bash
GET /api/habits?category=Health&status=active&search=exercise&sortBy=title&sortOrder=asc
Authorization: Bearer <token>
```

### Get Statistics
```bash
GET /api/progress/stats?period=30
Authorization: Bearer <token>
```

## 🔒 Security Features

### Data Validation
- Input sanitization and validation
- SQL injection prevention
- XSS protection
- Request size limiting

### Authentication & Authorization
- JWT token-based authentication
- Password hashing with bcrypt
- User session management
- Route protection middleware

### Rate Limiting
- Configurable rate limiting
- IP-based request tracking
- Abuse prevention

### CORS Protection
- Configurable CORS settings
- Origin validation
- Credential support

## 📊 Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly message"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing

Run tests with Jest:
```bash
npm test
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habits-tracker
JWT_SECRET=your-super-secure-production-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deployment Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **Vercel**: Serverless deployment
- **AWS**: EC2 or Lambda deployment
- **DigitalOcean**: Droplet deployment

## 📈 Performance Optimization

### Database Indexes
- User email (unique)
- Habit user + createdAt
- Progress user + habit + date (compound)
- Category and status indexes

### Caching Strategy
- Redis for session storage (optional)
- Response caching for statistics
- Database query optimization

## 🔧 Development

### Project Structure
```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── habitController.js
│   └── progressController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── notFound.js
├── models/
│   ├── User.js
│   ├── Habit.js
│   └── Progress.js
├── routes/
│   ├── auth.js
│   ├── habits.js
│   └── progress.js
├── server.js
├── package.json
└── README.md
```

### Adding New Features
1. Create model in `models/` directory
2. Create controller in `controllers/` directory
3. Create routes in `routes/` directory
4. Add validation middleware
5. Update server.js with new routes
6. Test thoroughly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: nisakshtechnologiespvtltd@gmail.com
- Create an issue in the repository
- Check the API documentation at `/api` endpoint

---

**Happy coding! 🚀**
