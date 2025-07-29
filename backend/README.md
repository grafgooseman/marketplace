# Airsoft Marketplace Backend

A Fastify-based backend for the Airsoft Marketplace with Supabase integration, JWT authentication, and comprehensive API features.

## Features

- **Fastify Framework**: High-performance Node.js web framework
- **Supabase Integration**: Backend-centric model with RLS (Row Level Security)
- **JWT Authentication**: Secure token-based authentication with JWKS verification
- **CORS Support**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting to prevent abuse
- **OpenAPI Documentation**: Auto-generated API documentation with Swagger UI
- **Per-request User Context**: User context and Supabase client for each request
- **Comprehensive Error Handling**: Proper error responses and logging

## Prerequisites

- Node.js 18+ 
- Supabase account and project
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=900000
```

### 3. Supabase Database Setup

Create the following tables in your Supabase database:

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);
```

#### Ads Table
```sql
CREATE TABLE ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  images TEXT[],
  location TEXT,
  contact_info JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all active ads" ON ads
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own ads" ON ads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ads" ON ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ads" ON ads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads" ON ads
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Start the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3001/docs`
- **Health Check**: `http://localhost:3001/health`

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /profile` - Get current user profile
- `PUT /profile` - Update current user profile
- `POST /refresh` - Refresh access token

### Ads (`/api/ads`)

- `GET /` - Get all ads (with filtering and pagination)
- `GET /:id` - Get single ad by ID
- `POST /` - Create new ad (authenticated)
- `PUT /:id` - Update ad (authenticated, owner only)
- `DELETE /:id` - Delete ad (authenticated, owner only)
- `GET /my/ads` - Get current user's ads (authenticated)

### Users (`/api/users`)

- `GET /:id` - Get user profile by ID
- `GET /me/profile` - Get current user's full profile (authenticated)
- `PUT /me/profile` - Update current user's profile (authenticated)
- `GET /:id/ads` - Get ads by user ID
- `GET /search` - Search users by name

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

1. Register or login using the `/api/auth/register` or `/api/auth/login` endpoints
2. The response will include a `session` object with `access_token`
3. Use this token in subsequent requests

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

The API includes rate limiting to prevent abuse:
- Default: 100 requests per 15 minutes
- Configurable via environment variables

## CORS

CORS is configured to allow requests from your frontend:
- Default origin: `http://localhost:3000`
- Configurable via `CORS_ORIGIN` environment variable

## Development

### Project Structure

```
backend/
├── src/
│   ├── index.js          # Main server file
│   ├── lib/
│   │   └── supabase.js   # Supabase client configuration
│   ├── middleware/
│   │   └── auth.js       # JWT authentication middleware
│   └── routes/
│       ├── auth.js       # Authentication routes
│       ├── ads.js        # Ads management routes
│       └── users.js      # User management routes
├── package.json
├── env.example
└── README.md
```

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Export a function that takes `fastify` and `options` parameters
3. Register the routes in `src/index.js`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Required |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `RATE_LIMIT_MAX` | Rate limit requests | 100 |
| `RATE_LIMIT_TIME_WINDOW` | Rate limit window (ms) | 900000 |

## Security Features

- **JWT Verification**: All tokens are verified using Supabase's JWKS
- **Row Level Security**: Database-level security with RLS policies
- **Rate Limiting**: Prevents API abuse
- **CORS**: Controlled cross-origin access
- **Input Validation**: Request body and query parameter validation
- **Error Handling**: Secure error responses without sensitive information

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Set up environment variables
4. Use a process manager like PM2
5. Set up reverse proxy (nginx)
6. Configure SSL/TLS certificates

## Troubleshooting

### Common Issues

1. **JWT Verification Fails**: Check Supabase URL and JWKS endpoint
2. **Database Connection Issues**: Verify Supabase credentials
3. **CORS Errors**: Check `CORS_ORIGIN` configuration
4. **Rate Limiting**: Adjust limits in environment variables

### Logs

The server uses structured logging. Check logs for detailed error information:
- Development: Pretty-printed logs
- Production: JSON structured logs

## License

MIT License 