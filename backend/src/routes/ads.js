import { supabase } from '../lib/supabase.js';
import { authenticateJWT, optionalAuth } from '../middleware/auth.js';

export async function adsRoutes(fastify, options) {
  // Get all ads (public)
  fastify.get('/', {
    schema: {
      description: 'Get all ads with optional filtering',
      tags: ['Ads'],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          price_min: { type: 'number' },
          price_max: { type: 'number' },
          search: { type: 'string' },
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
    },
    preHandler: optionalAuth
  }, async (request, reply) => {
    try {
      const { category, price_min, price_max, search, page = 1, limit = 20 } = request.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('ads')
        .select('*, profiles(full_name, avatar_url)', { count: 'exact' });

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }
      if (price_min !== undefined) {
        query = query.gte('price', price_min);
      }
      if (price_max !== undefined) {
        query = query.lte('price', price_max);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Add pagination
      query = query.range(offset, offset + limit - 1);

      const { data: ads, error, count } = await query;

      if (error) {
        return reply.status(400).send({
          error: 'Failed to fetch ads',
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
      fastify.log.error('Get ads error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch ads'
      });
    }
  });

  // Get single ad by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get a single ad by ID',
      tags: ['Ads'],
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
            ad: { type: 'object' }
          }
        }
      }
    },
    preHandler: optionalAuth
  }, async (request, reply) => {
    try {
      const { id } = request.params;

      const { data: ad, error } = await supabase
        .from('ads')
        .select('*, profiles(full_name, avatar_url)')
        .eq('id', id)
        .single();

      if (error) {
        return reply.status(404).send({
          error: 'Ad not found',
          message: 'The requested ad does not exist'
        });
      }

      return reply.send({ ad });
    } catch (error) {
      fastify.log.error('Get ad error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch ad'
      });
    }
  });

  // Create new ad
  fastify.post('/', {
    schema: {
      description: 'Create a new ad',
      tags: ['Ads'],
      security: [{ Bearer: [] }],
      body: {
        type: 'object',
        required: ['title', 'description', 'price', 'category'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', minLength: 1, maxLength: 1000 },
          price: { type: 'number', minimum: 0 },
          category: { type: 'string' },
          condition: { type: 'string', enum: ['new', 'like_new', 'good', 'fair', 'poor'] },
          images: { type: 'array', items: { type: 'string' } },
          location: { type: 'string' },
          contact_info: { type: 'object' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            ad: { type: 'object' }
          }
        }
      }
    },
    preHandler: authenticateJWT
  }, async (request, reply) => {
    try {
      const { title, description, price, category, condition, images, location, contact_info } = request.body;
      const userId = request.user.id;

      const { data: ad, error } = await request.supabase
        .from('ads')
        .insert({
          title,
          description,
          price,
          category,
          condition,
          images,
          location,
          contact_info,
          user_id: userId,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        return reply.status(400).send({
          error: 'Failed to create ad',
          message: error.message
        });
      }

      return reply.status(201).send({
        message: 'Ad created successfully',
        ad
      });
    } catch (error) {
      fastify.log.error('Create ad error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to create ad'
      });
    }
  });

  // Update ad
  fastify.put('/:id', {
    schema: {
      description: 'Update an existing ad',
      tags: ['Ads'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', minLength: 1, maxLength: 1000 },
          price: { type: 'number', minimum: 0 },
          category: { type: 'string' },
          condition: { type: 'string', enum: ['new', 'like_new', 'good', 'fair', 'poor'] },
          images: { type: 'array', items: { type: 'string' } },
          location: { type: 'string' },
          contact_info: { type: 'object' },
          status: { type: 'string', enum: ['active', 'sold', 'inactive'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ad: { type: 'object' }
          }
        }
      }
    },
    preHandler: authenticateJWT
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;
      const updateData = request.body;

      // First check if the ad belongs to the user
      const { data: existingAd, error: fetchError } = await request.supabase
        .from('ads')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingAd) {
        return reply.status(404).send({
          error: 'Ad not found',
          message: 'The requested ad does not exist'
        });
      }

      if (existingAd.user_id !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You can only update your own ads'
        });
      }

      const { data: ad, error } = await request.supabase
        .from('ads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return reply.status(400).send({
          error: 'Failed to update ad',
          message: error.message
        });
      }

      return reply.send({
        message: 'Ad updated successfully',
        ad
      });
    } catch (error) {
      fastify.log.error('Update ad error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to update ad'
      });
    }
  });

  // Delete ad
  fastify.delete('/:id', {
    schema: {
      description: 'Delete an ad',
      tags: ['Ads'],
      security: [{ Bearer: [] }],
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
            message: { type: 'string' }
          }
        }
      }
    },
    preHandler: authenticateJWT
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;

      // First check if the ad belongs to the user
      const { data: existingAd, error: fetchError } = await request.supabase
        .from('ads')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingAd) {
        return reply.status(404).send({
          error: 'Ad not found',
          message: 'The requested ad does not exist'
        });
      }

      if (existingAd.user_id !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You can only delete your own ads'
        });
      }

      const { error } = await request.supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) {
        return reply.status(400).send({
          error: 'Failed to delete ad',
          message: error.message
        });
      }

      return reply.send({
        message: 'Ad deleted successfully'
      });
    } catch (error) {
      fastify.log.error('Delete ad error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to delete ad'
      });
    }
  });

  // Get user's ads
  fastify.get('/my/ads', {
    schema: {
      description: 'Get current user\'s ads',
      tags: ['Ads'],
      security: [{ Bearer: [] }],
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
    },
    preHandler: authenticateJWT
  }, async (request, reply) => {
    try {
      const { status, page = 1, limit = 20 } = request.query;
      const userId = request.user.id;
      const offset = (page - 1) * limit;

      let query = request.supabase
        .from('ads')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

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
} 