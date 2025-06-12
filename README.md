# Admin Dashboard Backend

A secure Node.js backend for an admin dashboard with JWT authentication and encrypted passwords.

## Features

- Secure authentication with JWT tokens
- Password encryption using bcrypt
- MongoDB integration
- Express.js REST API
- Protected admin routes
- Input validation
- Error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)
- npm or yarn package manager

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/admin-dashboard
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. Make sure MongoDB is running on your system or update the MONGODB_URI in .env to point to your MongoDB instance.

4. Start the server:

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register a new admin

  - Body: { email, password, name }

- `POST /api/auth/login` - Login and get token

  - Body: { email, password }

- `GET /api/auth/me` - Get current admin profile (Protected)
  - Header: x-auth-token: [JWT Token]

### Admin Routes

- `GET /api/admin/dashboard` - Get dashboard data (Protected)

  - Header: x-auth-token: [JWT Token]

- `PUT /api/admin/profile` - Update admin profile (Protected)
  - Header: x-auth-token: [JWT Token]
  - Body: { name, email }

## Security Features

- Passwords are hashed using bcrypt before storing
- JWT tokens for authentication
- Protected routes using middleware
- Input validation using express-validator
- MongoDB injection protection
- CORS enabled
- Request body parsing limits

## Error Handling

The API includes comprehensive error handling for:

- Invalid credentials
- Duplicate email addresses
- Invalid JWT tokens
- Server errors
- Validation errors

## Development

To run the server in development mode with hot reloading:

```bash
npm run dev
```

## Production

For production deployment:

1. Update the JWT_SECRET in .env
2. Set NODE_ENV=production
3. Update MONGODB_URI to your production database
4. Run with `npm start`
