import type { OpenAPIV3 } from 'openapi-types';

const swaggerConfig: Omit<OpenAPIV3.Document, 'paths'> = {
  openapi: '3.0.0',
  info: {
    title: 'FIAP X Hackaton',
    description: 'API documentation for FIAP X Hackaton',
    version: '0.1.0',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Users', description: 'Users related end-points' },
    {
      name: 'Auth',
      description: 'Authentication related end-points',
    },
  ],
};

export default swaggerConfig;
