import { Pool, PoolConfig } from 'pg';
import { getEnvVar } from './envConfig';

let pool: Pool | null = null;

/**
 * Create the database configuration parameters
 * @returns PoolConfig object representing the database configuration
 */
function createDbConfig(): PoolConfig {
  const envType = getEnvVar('NODE_ENV', 'development');

  if (envType === 'production') {
    return {
      connectionString: getEnvVar('connectionString'),
      ssl: {rejectUnauthorized: false }
    };
  } else {
    return {
      host: getEnvVar('DB_HOST'),
      port: parseInt(getEnvVar('DB_PORT')),
      database: getEnvVar('DB_DATABASE'),
      user: getEnvVar('DB_USER'),
      password: getEnvVar('DB_PASSWORD'),
      ssl: {
        rejectUnauthorized: false
      }
    };
  }
}

/**
 * Establish the database connection
 * @returns Void promise - Promise<void>
 * @throws Will throw an error if the database connection test fails or if required environment variables are missing
 */
export async function connectToDatabase(): Promise<void> {
  if (pool) {
    console.log('Database connection already exists');
    return;
  }

  const config = createDbConfig();
  pool = new Pool(config);

  try {
    const client = await pool.connect();
    console.log('Test connection to the database is successful');
    client.release();
  } catch (error) {
    console.error('Error connecting to database', error);
    throw error;
  }
}

/**
 * Disconnect from the database
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection closed');
  }
}

/**
 * Get the Postgres connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not connected -- call connectToDatabase() first');
  }
  return pool;
}

// for backwards compatibility?
export { pool };
