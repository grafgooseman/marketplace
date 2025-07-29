import { supabase, createSupabaseClient } from '../lib/supabase.js';

// JWT verification middleware using Supabase
export const authenticateJWT = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Use Supabase to verify the token and get user info
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      request.log.error('JWT verification failed:', error);
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }

    // Extract user information
    const userInfo = {
      id: user.id,
      email: user.email,
      role: user.role || 'authenticated',
      aud: user.aud
    };

    // Create Supabase client with user context
    const supabaseClient = createSupabaseClient(token);

    // Attach user and client to request
    request.user = userInfo;
    request.supabase = supabaseClient;

    return;
  } catch (error) {
    request.log.error('JWT verification failed:', error);
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return;
    }

    const token = authHeader.substring(7);

    // Use Supabase to verify the token and get user info
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Token is invalid, but we don't fail the request
      request.log.warn('Optional JWT verification failed:', error);
      return;
    }

    // Extract user information
    const userInfo = {
      id: user.id,
      email: user.email,
      role: user.role || 'authenticated',
      aud: user.aud
    };

    // Create Supabase client with user context
    const supabaseClient = createSupabaseClient(token);

    // Attach user and client to request
    request.user = userInfo;
    request.supabase = supabaseClient;

    return;
  } catch (error) {
    // Token is invalid, but we don't fail the request
    request.log.warn('Optional JWT verification failed:', error);
    return;
  }
}; 