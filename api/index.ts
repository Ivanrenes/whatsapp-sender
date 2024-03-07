import express from 'express';
import cors from 'cors';
import wppRouter from './routers/wpp';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(cors());

app.use('/wpp', wppRouter);

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
