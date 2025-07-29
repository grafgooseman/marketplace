import { supabase } from '../lib/supabase.js';
import { authenticateJWT } from '../middleware/auth.js';

export async function userRoutes(fastify, options) {
  // Get user profile by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get user profile by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            profile: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, created_at')
        .eq('id', id)
        .single();

      if (error || !profile) {
        return reply.status(404).send({
          error: 'User not found',
          message: 'The requested user does not exist'
        });
      }

      return reply.send({ profile });
    } catch (error) {
      fastify.log.error('Get user profile error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch user profile'
      });
    }
  });

  // Get current user's full profile
  fastify.get('/me/profile', {
    schema: {
      description: 'Get current user\'s full profile',
      tags: ['Users'],
      security: [{ Bearer: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            profile: { type: 'object' }
          }
        }
      }
    },
    preHandler: authenticateJWT
  }, async (request, reply) => {
    try {
      const userId = request.user.id;

      const { data: profile, error } = await request.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return reply.status(404).send({
          error: 'Profile not found',
          message: 'User profile does not exist'
        });
      }

      return reply.send({ profile });
    } catch (error) {
      fastify.log.error('Get current user profile error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch user profile'
      });
    }
  });

  // Update current user's profile
  fastify.put('/me/profile', {
    schema: {
      description: 'Update current user\'s profile',
      tags: ['Users'],
      security: [{ Bearer: [] }],
      body: {
        type: 'object',
        properties: {
          full_name: { type: 'string', minLength: 1, maxLength: 100 },
          avatar_url: { type: 'string', format: 'uri' },
          bio: { type: 'string', maxLength: 500 },
          location: { type: 'string', maxLength: 100 },
          phone: { type: 'string' },
          website: { type: 'string', format: 'uri' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            profile: { type: 'object' }
          }
        }
      }
    },
    preHandler: authenticateJWT
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const updateData = request.body;

      const { data: profile, error } = await request.supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return reply.status(400).send({
          error: 'Failed to update profile',
          message: error.message
        });
      }

      return reply.send({
        message: 'Profile updated successfully',
        profile
      });
    } catch (error) {
      fastify.log.error('Update profile error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to update profile'
      });
    }
  });

  // Get user's ads
  fastify.get('/:id/ads', {
    schema: {
      description: 'Get ads by user ID',
      tags: ['Users'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'sold', 'inactive'] },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ads: { type: 'array' },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { status, page = 1, limit = 20 } = request.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('ads')
        .select('*', { count: 'exact' })
        .eq('user_id', id);

      if (status) {
        query = query.eq('status', status);
      }

      query = query.range(offset, offset + limit - 1);

      const { data: ads, error, count } = await query;

      if (error) {
        return reply.status(400).send({
          error: 'Failed to fetch user ads',
          message: error.message
        });
      }

      return reply.send({
        ads,
        total: count,
        page,
        limit
      });
    } catch (error) {
      fastify.log.error('Get user ads error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch user ads'
      });
    }
  });

  // Search users
  fastify.get('/search', {
    schema: {
      description: 'Search users by name',
      tags: ['Users'],
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', minLength: 1 },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            users: { type: 'array' },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { q, page = 1, limit = 20 } = request.query;
      const offset = (page - 1) * limit;

      const { data: users, error, count } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, created_at', { count: 'exact' })
        .ilike('full_name', `%${q}%`)
        .range(offset, offset + limit - 1);

      if (error) {
        return reply.status(400).send({
          error: 'Failed to search users',
          message: error.message
        });
      }

      return reply.send({
        users,
        total: count,
        page,
        limit
      });
    } catch (error) {
      fastify.log.error('Search users error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to search users'
      });
    }
  });
} 