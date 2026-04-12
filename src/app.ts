/**
 * Express application for the IsTheBridgeUp API
 * 
 * @author Preston Sia
 */

import cors from 'cors';
import { limiter } from './middleware/rateLimiter';
import nocache from 'nocache';
import express, {Express} from 'express';
import { routes } from './routes';

const createApp = (): Express => {
  const app = express();

  // MIDDLEWARE configuration application-wide
  app.use(cors());
  app.use(nocache()); // disable caching for clients
  app.use(limiter);
  app.use(express.json({ limit: '10mb' }));

  // Configure base ROUTES
  app.use('/', routes);

  return app;
};

export default createApp;
