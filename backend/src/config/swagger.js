import swaggerJsdoc from 'swagger-jsdoc';
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'media_sharing_jalna API',
      version: '1.0.0',
      description: 'API documentation for the media_sharing_jalna application.',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Development server' }],
  },
  apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
