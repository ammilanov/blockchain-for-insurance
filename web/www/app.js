'use strict';

import { Server } from 'http';
import express from 'express';
import socketIo from 'socket.io';
import configureExpress from './config/express';
import shopRouter, { wsConfig as shopWsConfig }
  from './routers/shop.router';
import selfServiceRouter, { wsConfig as selfServiceWsConfig }
  from './routers/self-service.router';
import repairServiceRouter, { wsConfig as repairServiceWsConfig }
  from './routers/repair-service.router';
import contractManagementRouter, { wsConfig as contractMgmtWsConfig }
  from './routers/contract-management.router';

const SHOP_ROOT_URL = '/shop';
const SELF_SERVICE_ROOT_URL = '/self-service';
const REPAIR_SERVICE_ROOT_URL = '/repair-service';
const CONTRACT_MGMT_ROOT_URL = '/contract-management';

const app = express();
const httpServer = new Server(app);

// Setup web sockets
const io = socketIo(httpServer);
shopWsConfig(io.of(SHOP_ROOT_URL));
selfServiceWsConfig(io.of(SELF_SERVICE_ROOT_URL));
repairServiceWsConfig(io.of(REPAIR_SERVICE_ROOT_URL));
contractMgmtWsConfig(io.of(CONTRACT_MGMT_ROOT_URL));

configureExpress(app);

app.get('/', (req, res) => {
  res.render('home', { homeActive: true });
});

// Setup routing
app.use(SHOP_ROOT_URL, shopRouter);
app.use(SELF_SERVICE_ROOT_URL, selfServiceRouter);
app.use(REPAIR_SERVICE_ROOT_URL, repairServiceRouter);
app.use(CONTRACT_MGMT_ROOT_URL, contractManagementRouter);

export default httpServer;
