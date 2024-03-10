import dotenv from 'dotenv';
dotenv.config();

import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { RegisterRoutes } from './router/routes';
import { errorHandler } from '@/middlewares/error-handling';
import bodyParser from 'body-parser';

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

RegisterRoutes(app);

app.use(errorHandler);

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: '/definitions/swagger.json',
      persistAuthorizationInSession: true,
      persistAuthorization: true
    }
  })
);

app.use('/definitions', express.static('./src/server/definitions'));

//listen on 8081
app.listen(8081, () => {
  console.log('Server is running on port 8081');
});

module.exports = app;
