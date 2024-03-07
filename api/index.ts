import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { RegisterRoutes } from './router/routes';

const app = express();

app.use(cors());

RegisterRoutes(app);

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: '/public/swagger.json'
    }
  })
);

app.use('/public', express.static('public'));

app.listen(8081, () => {
  console.log('Server is running on port 8081');
});

module.exports = app;
