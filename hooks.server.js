import { sequence } from '@sveltejs/kit/hooks';
import { DATABASE_URL } from '$env/static/private';
import { auth } from '$lib/server/lucia.js';
import pg from 'pg';

const { Pool } = pg;

let pool = null;

// Initialize PostgreSQL connection pool
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    pool.on('connect', () => {
      console.log('Connected to PostgreSQL');
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }
  return pool;
}

export const main = async ({ event, resolve }) => {
  // Initialize database connection pool
  try {
    const db = getPool();
    event.locals.db = db; // Make pool available in event.locals
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error);
    throw new Error("Failed to connect to the database");
  }

  const sessionId = event.cookies.get('auth_session') || null;
  let user = null;
  let session = null;

  if (sessionId) {
    try {
      session = await auth.validateSession(sessionId);
      user = session?.user || null;
    } catch (error) {
      console.error('Failed to validate session:', error);
      event.cookies.delete('auth_session', { path: '/' });
    }
  }

  event.locals.user = user;
  event.locals.session = session;

  if (event?.locals?.user) {
    event.locals.authedUser = {
      id: event.locals.user?.userId,
      email: event.locals.user?.email,
      username: event.locals.user?.username
    };
  }

  const response = await resolve(event);
  return response;
};

export async function handleError({ error, event, status, message }) {
  const errorId = crypto.randomUUID();
  const isNotFound = !event.route.id && event.url.pathname !== '/';
  
  return {
    message: error?.message || 'Whoops !',
    status: isNotFound ? 404 : (error?.status || 500),
    errorId
  };
}

export const handle = sequence(main);