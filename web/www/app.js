'use strict';

import express from 'express';
import configureExpress from './config/express';
import shopRouter from './routers/shop.router';
import selfServiceRouter from './routers/self-service.router';
import repairServiceRouter from './routers/repair-service.router';
import contractManagementRouter from './routers/contract-management.router';

const app = express();

configureExpress(app);

app.get('/', (req, res) => {
  res.render('home', { homeActive: true });
});

app.use('/shop', shopRouter);
app.use('/self-service', selfServiceRouter);
app.use('/repair-service', repairServiceRouter);
app.use('/contract-management', contractManagementRouter);

export default app;
