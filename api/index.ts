import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { exec } from 'child_process';

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

app.on('exit', async () => {
  exec('rm -rf .wwebjs_cache .wwebjs_auth');
});

module.exports = app;
