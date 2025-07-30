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

      // Log the Supabase response structure for debugging
      console.log('Supabase registration response:', { data, error });

      // Create clean, serializable objects
      const cleanUser = {
        id: data.user.id,
        email: data.user.email,
        aud: data.user.aud,
        role: data.user.role,
        email_confirmed_at: data.user.email_confirmed_at,
        phone: data.user.phone,
        phone_confirmed_at: data.user.phone_confirmed_at,
        confirmed_at: data.user.confirmed_at,
        last_sign_in_at: data.user.last_sign_in_at,
        app_metadata: data.user.app_metadata,
        user_metadata: data.user.user_metadata,
        identities: data.user.identities,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
        is_anonymous: data.user.is_anonymous
      };

      const cleanSession = data.session ? {
        access_token: data.session.access_token,
        token_type: data.session.token_type,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
        refresh_token: data.session.refresh_token
      } : null;

      return reply.status(201).send({
        message: 'User registered successfully',
        user: cleanUser,
        session: cleanSession
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

      // Log the Supabase response structure for debugging
      console.log('Supabase login response:', { data, error });

      // Extract only essential properties manually to avoid serialization issues
      const user = data.user;
      const session = data.session;

      console.log('Raw user id:', user?.id);
      console.log('Raw user email:', user?.email);
      console.log('Raw session access_token exists:', !!session?.access_token);
      console.log('Raw session refresh_token exists:', !!session?.refresh_token);

      // Create minimal, safe objects
      const safeUser = {
        id: user?.id || null,
        email: user?.email || null,
        aud: user?.aud || null,
        role: user?.role || null,
        email_confirmed_at: user?.email_confirmed_at || null,
        phone: user?.phone || "",
        confirmed_at: user?.confirmed_at || null,
        last_sign_in_at: user?.last_sign_in_at || null,
        created_at: user?.created_at || null,
        updated_at: user?.updated_at || null,
        is_anonymous: user?.is_anonymous || false
      };

      // Only add user_metadata if it exists and is simple
      if (user?.user_metadata && typeof user.user_metadata === 'object') {
        try {
          safeUser.user_metadata = {
            full_name: user.user_metadata.full_name || null,
            email: user.user_metadata.email || null
          };
        } catch (e) {
          console.log('Error accessing user_metadata:', e);
          safeUser.user_metadata = {};
        }
      }

      const safeSession = {
        access_token: session?.access_token || null,
        token_type: session?.token_type || 'bearer',
        expires_in: session?.expires_in || 3600,
        expires_at: session?.expires_at || null,
        refresh_token: session?.refresh_token || null
      };

      console.log('Safe user object:', safeUser);
      console.log('Safe session object:', safeSession);

      // Test serialization
      try {
        const testSerialization = JSON.stringify({ user: safeUser, session: safeSession });
        console.log('Serialization test successful, length:', testSerialization.length);
        console.log('Serialized content preview:', testSerialization.substring(0, 200) + '...');
      } catch (e) {
        console.log('Serialization test failed:', e);
      }

      const responseObject = {
        message: 'Login successful',
        user: safeUser,
        session: safeSession
      };

      // Try manual JSON response to bypass any Fastify serialization issues
      const manualJson = JSON.stringify(responseObject);
      console.log('Manual JSON length:', manualJson.length);
      console.log('Manual JSON preview:', manualJson.substring(0, 300) + '...');

      return reply
        .code(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send(manualJson);
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
      // Get the token from the Authorization header
      const token = request.headers.authorization.substring(7); // Remove 'Bearer ' prefix
      
      // Use the global supabase instance to get user data with the token
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error) {
        console.log('Profile endpoint - Supabase error:', error);
        return reply.status(400).send({
          error: 'Failed to get user profile',
          message: error.message
        });
      }

      if (!user) {
        console.log('Profile endpoint - No user returned from Supabase');
        return reply.status(401).send({
          error: 'User not found',
          message: 'No user associated with this token'
        });
      }

      console.log('Profile endpoint - Raw user from Supabase:', user);
      console.log('Profile endpoint - User metadata:', user.user_metadata);

      // Create a clean user object similar to login response
      const cleanUser = {
        id: user.id,
        email: user.email,
        aud: user.aud,
        role: user.role,
        email_confirmed_at: user.email_confirmed_at,
        phone: user.phone,
        phone_confirmed_at: user.phone_confirmed_at,
        confirmed_at: user.confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
        identities: user.identities,
        created_at: user.created_at,
        updated_at: user.updated_at,
        is_anonymous: user.is_anonymous
      };

      console.log('Profile endpoint - Clean user being returned:', cleanUser);

      return reply.send({
        user: cleanUser
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