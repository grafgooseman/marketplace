import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';

import { authRoutes } from './routes/auth.js';
import { adsRoutes } from './routes/ads.js';
import { userRoutes } from './routes/users.js';
import { authenticateJWT, optionalAuth } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
});

await fastify.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW) || 900000 // 15 minutes
});

// Swagger configuration
await fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Airsoft Marketplace API',
      description: 'Backend API for Airsoft Marketplace',
      version: '1.0.0'
    },
    host: `localhost:${process.env.PORT || 3001}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    }
  }
});

await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
});

// Health check route
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register authentication middleware
fastify.decorate('authenticateJWT', authenticateJWT);
fastify.decorate('optionalAuth', optionalAuth);

// Register routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(adsRoutes, { prefix: '/api/ads' });
await fastify.register(userRoutes, { prefix: '/api/users' });

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation
    });
  }
  
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message
    });
  }
  
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`API Documentation available at http://localhost:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 