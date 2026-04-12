/**
 * Server management code for the IsTheBridgeUp API
 * 
 * @author Preston Sia
 */

import createApp from '@/app';
import { isDatabaseEnabled, validateEnv } from './utilities/envConfig';
import { connectToDatabase, disconnectFromDatabase } from './utilities/pgDatabase';

const PORT = process.env.PORT || 8000;

/**
 * START the server
 * Includes graceful shutdown
 */
const startServer = async(): Promise<void> => {
  console.log('\n');

  try {
    // Validate environment
    validateEnv();
    console.log('Environment variables validated');

    // Connect to database if specified by env
    if (isDatabaseEnabled()) {
      await connectToDatabase();
      console.log('Database connection successful');
    } else {
      console.log('Using local static records for bridge data');
    }

    const app = createApp();
    const server = app.listen(PORT, () => {
      console.log('\n');
      console.log('/=======\\    IsTheBridgeUp?');
      console.log(`Server running on port ${PORT}`);
    });

    // GRACEFUL Shutdown Handling
    const gracefulShutdown = (sig: string) => {
      console.log(`\n Received ${sig}. Starting graceful shutdown...`);

      server.close(async(err) => {
        if (err) {
          console.error('Error during server shutdown: ', err);
          process.exit(1);
        }

        await disconnectFromDatabase();
        
        console.log('Server closed successfully. Goodbye!');
        process.exit(0);
      });
    };

    // Register SIGNAL HANDLERS for graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));   // SIGTERM
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));     // SIGINT
  } catch (err) {
    console.error('Failed to start the server: ', err);
    process.exit(1);
  }
};

// Handle uncaught EXCEPTIONS and REJECTIONS
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception: ', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at: ', promise, 'Reason:', reason);
  process.exit(1);
});

// Actually START the server
startServer();
