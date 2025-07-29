import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-client';
import { createSupabaseClient } from '../lib/supabase.js';

// JWKS client for Supabase
const client = jwksClient({
  jwksUri: `${process.env.SUPABASE_URL}/rest/v1/auth/jwks`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

// Get signing key from JWKS
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

// JWT verification middleware
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

    // Verify JWT token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, {
        issuer: `${process.env.SUPABASE_URL}`,
        audience: 'authenticated',
        algorithms: ['RS256']
      }, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });

    // Extract user information
    const user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role || 'authenticated',
      aud: decoded.aud
    };

    // Create Supabase client with user context
    const supabaseClient = createSupabaseClient(token);

    // Attach user and client to request
    request.user = user;
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

    // Verify JWT token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, {
        issuer: `${process.env.SUPABASE_URL}`,
        audience: 'authenticated',
        algorithms: ['RS256']
      }, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });

    // Extract user information
    const user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role || 'authenticated',
      aud: decoded.aud
    };

    // Create Supabase client with user context
    const supabaseClient = createSupabaseClient(token);

    // Attach user and client to request
    request.user = user;
    request.supabase = supabaseClient;

    return;
  } catch (error) {
    // Token is invalid, but we don't fail the request
    request.log.warn('Optional JWT verification failed:', error);
    return;
  }
}; 