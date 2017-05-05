import express from 'express';

import * as InsurancePeer from '../blockchain/insurancePeer';

const router = express.Router();

// router.get('/login', (req, res) => {
//   res.render('login', { selfServiceActive: true });
// });

router.post('/api/contracts', async (req, res) => {
  if (typeof req.body.user !== 'object') {
    res.json({ error: 'Invalid request!' });
    return;
  }

  try {
    const { username, password } = req.body.user;
    if (await InsurancePeer.authenticateUser(username, password)) {
      const contracts = await InsurancePeer.getContracts(username);
      res.json({ success: true, contracts });
      return;
    } else {
      res.json({ error: 'Invalid login!' });
      return;
    }
  } catch (e) {
    console.log(e);
    res.json({ error: 'Error accessing blockchain!' });
    return;
  }
});

router.post('/api/file-claim', async (req, res) => {
  if (typeof req.body.user !== 'object' ||
    typeof req.body.contractUuid !== 'string' ||
    typeof req.body.claim != 'object') {
    res.json({ error: 'Invalid request!' });
    return;
  }

  try {
    const { user, contractUuid, claim } = req.body;
    const { username, password } = user;
    if (await InsurancePeer.authenticateUser(username, password)) {
      await InsurancePeer.fileClaim({
        contractUuid,
        date: new Date(),
        description: claim.description,
        isTheft: claim.isTheft
       });
      res.json({ success: true });
      return;
    } else {
      res.json({ error: 'Invalid login!' });
      return;
    }
  } catch (e) {
    console.log(e);
    res.json({ error: 'Error accessing blockchain!' });
    return;
  }
});

router.post('/api/authenticate-user', async (req, res) => {
  if (!typeof req.body.user === 'object') {
    res.json({ error: 'Invalid request!' });
    return
  }

  try {
    const { username, password } = req.body.user;
    const success = await InsurancePeer.authenticateUser(username, password);
    res.json({ success });
    return;
  } catch (e) {
    console.log(e);
    res.json({ error: 'Error accessing blockchain!' });
    return;
  }
});

router.get('*', (req, res) => {
  // // If no session present then redirect to login
  // if(!req.cookies['INS_BC_SESSION']) {
  //   res.redirect(301, req.baseUrl + '/login');
  //   return;
  // }

  res.render('self-service', { selfServiceActive: true });
});

export default router;
