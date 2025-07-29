import { supabase } from '../lib/supabase.js';

export async function authRoutes(fastify, options) {
  // Register user
  fastify.post('/register', {
    schema: {
      description: 'Register a new user',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          user_metadata: {
            type: 'object',
            properties: {
              full_name: { type: 'string' },
              phone: { type: 'string' }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            session: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password, user_metadata } = request.body;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: user_metadata
        }
      });

      if (error) {
        return reply.status(400).send({
          error: 'Registration failed',
          message: error.message
        });
      }

      return reply.status(201).send({
        message: 'User registered successfully',
        user: data.user,
        session: data.session
      });
    } catch (error) {
      fastify.log.error('Registration error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to register user'
      });
    }
  });

  // Login user
  fastify.post('/login', {
    schema: {
      description: 'Login user with email and password',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            session: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password } = request.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return reply.status(401).send({
          error: 'Login failed',
          message: error.message
        });
      }

      return reply.send({
        message: 'Login successful',
        user: data.user,
        session: data.session
      });
    } catch (error) {
      fastify.log.error('Login error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to login'
      });
    }
  });

  // Logout user
  fastify.post('/logout', {
    schema: {
      description: 'Logout user',
      tags: ['Authentication'],
      security: [{ Bearer: [] }]
    },
    preHandler: fastify.authenticateJWT
  }, async (request, reply) => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return reply.status(400).send({
          error: 'Logout failed',
          message: error.message
        });
      }

      return reply.send({
        message: 'Logout successful'
      });
    } catch (error) {
      fastify.log.error('Logout error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to logout'
      });
    }
  });

  // Get current user profile
  fastify.get('/profile', {
    schema: {
      description: 'Get current user profile',
      tags: ['Authentication'],
      security: [{ Bearer: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            user: { type: 'object' }
          }
        }
      }
    },
    preHandler: fastify.authenticateJWT
  }, async (request, reply) => {
    try {
      const { data: { user }, error } = await request.supabase.auth.getUser();

      if (error) {
        return reply.status(400).send({
          error: 'Failed to get user profile',
          message: error.message
        });
      }

      return reply.send({
        user
      });
    } catch (error) {
      fastify.log.error('Get profile error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to get user profile'
      });
    }
  });

  // Update user profile
  fastify.put('/profile', {
    schema: {
      description: 'Update current user profile',
      tags: ['Authentication'],
      security: [{ Bearer: [] }],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          user_metadata: {
            type: 'object',
            properties: {
              full_name: { type: 'string' },
              phone: { type: 'string' },
              avatar_url: { type: 'string' }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: { type: 'object' }
          }
        }
      }
    },
    preHandler: fastify.authenticateJWT
  }, async (request, reply) => {
    try {
      const { email, user_metadata } = request.body;

      const { data, error } = await request.supabase.auth.updateUser({
        email,
        data: user_metadata
      });

      if (error) {
        return reply.status(400).send({
          error: 'Failed to update profile',
          message: error.message
        });
      }

      return reply.send({
        message: 'Profile updated successfully',
        user: data.user
      });
    } catch (error) {
      fastify.log.error('Update profile error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to update profile'
      });
    }
  });

  // Refresh token
  fastify.post('/refresh', {
    schema: {
      description: 'Refresh access token',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['refresh_token'],
        properties: {
          refresh_token: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            session: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { refresh_token } = request.body;

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token
      });

      if (error) {
        return reply.status(401).send({
          error: 'Token refresh failed',
          message: error.message
        });
      }

      return reply.send({
        message: 'Token refreshed successfully',
        session: data.session
      });
    } catch (error) {
      fastify.log.error('Token refresh error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to refresh token'
      });
    }
  });
} 