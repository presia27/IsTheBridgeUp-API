/**
 * Main Express routes for this server.
 */

import { Router } from 'express';
import { bridgeRoutes } from './bridgeRoutes';

export const routes = Router();

routes.get('/', (request, response) => {
  response.json({
    success: true,
    message: 'IsTheBridgeUp API. This message indicates that the service is operational.',
    timestamp: new Date().toISOString(),
    endpoints: {
      
    },
    documentation: 'to be added soon...'
  });
});

routes.use('/api/v1/bridges', bridgeRoutes);
