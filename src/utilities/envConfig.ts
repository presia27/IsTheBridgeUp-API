/**
 * Environment configuration
 */

import dotenv from 'dotenv';
import path from 'path';

// Required variables
const requiredVarsDev: string[] = [

];

const requiredDBVarsDev: string[] = [
  'DB_HOST',
  'DB_PORT',
  'DB_DATABASE',
  'DB_USER',
  'DB_PASSWORD'
];

const requiredVarsProd: string[] = [

];

const requiredDBVarsProd: string[] = [
  'connectionString'
];

// Load .env
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({path: envPath}); // Load env at envPath
dotenv.config();                // load default .env

/** 
 * Retrieve the value of the specified key,
 * or return a default key if provided.
 * If none is found, throw an error.
 */
export const getEnvVar = (key: string, defaultVal?: string): string => {
  const val = process.env[key];

  if (val !== undefined) {
    return val;
  }

  if (defaultVal !== undefined) {
    return defaultVal;
  }

  throw new Error(`Environment variable key '${key}' not set`);
};

/** Check if this is a development environment according to the file */
export const isDevelopment = (): boolean => {
  return getEnvVar('NODE_ENV', 'development') === 'development';
};

/** Check if this is a production environment according to the file */
export const isProduction = (): boolean => {
  return getEnvVar('NODE_ENV', 'development') === 'production';
};

export const isDatabaseEnabled = (): boolean => {
  return getEnvVar('USE_DATABASE') === 'true';
};

/**
 * Validate the loaded env file to ensure all required
 * keys and values are present.
 */
export const validateEnv = (): void => {
  const requiredVars = isProduction() ? requiredVarsProd : requiredVarsDev;

  if (isDatabaseEnabled()) {
    const dbVars = isProduction() ? requiredDBVarsProd : requiredDBVarsDev;
    requiredVars.concat(dbVars);
  }

  const missing = requiredVars.filter(varName => {
    try {
      getEnvVar(varName);
      return false;
    } catch {
      return true;
    }
  });

  if (missing.length > 0) {
    throw new Error(`The loaded environment is missing the following variables: ${missing.join(', ')}`);
  }
};
