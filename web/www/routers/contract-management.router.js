import express from 'express';

import * as InsurancePeer from '../blockchain/insurancePeer';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('contract-management-main', { contractManagementActive: true });
});

router.post('/api/claims', async (req, res) => {
  let { status } = req.body;
  if (typeof status === 'string' && status[0]) {
    status = status[0].toUpperCase();
  }
  try {
    let claims = await InsurancePeer.getClaims(status);
    res.json(claims);
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

router.post('/api/process-claim', async (req, res) => {
  let { contractUuid, uuid, status, refundable } = req.body;
  if (typeof contractUuid !== 'string'
    || typeof uuid !== 'string'
    || !(typeof status === 'string' && status[0])
    || typeof refundable !== 'number') {
    res.json({ error: 'Invalid request.' });
    return;
  }
  status = status[0].toUpperCase();

  try {
    let success = await InsurancePeer.processClaim(
      contractUuid, uuid, status, refundable);
    res.json({ success });
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

router.post('/api/contract-types', async (req, res) => {
  try {
    let contractTypes = await InsurancePeer.getContractTypes();
    res.json(contractTypes);
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

router.post('/api/create-contract-type', async (req, res) => {
  let {
    shopType,
    formulaPerDay,
    maxSumInsured,
    theftInsured,
    description,
    conditions,
    minDurationDays,
    maxDurationDays,
    active
  } = req.body;
  if (!(typeof shopType === 'string' && shopType[0])
    || typeof formulaPerDay !== 'string'
    || typeof maxSumInsured !== 'number'
    || typeof theftInsured !== 'boolean'
    || typeof description !== 'string'
    || typeof conditions !== 'string'
    || typeof minDurationDays !== 'number'
    || typeof maxDurationDays !== 'number'
    || typeof active !== 'boolean') {
    res.json({ error: 'Invalid request.' });
    return;
  }
  shopType = shopType.toUpperCase();

  try {
    const uuid = await InsurancePeer.createContractType({
      shopType,
      formulaPerDay,
      maxSumInsured,
      theftInsured,
      description,
      conditions,
      minDurationDays,
      maxDurationDays,
      active
    });
    res.json({ success: true, uuid });
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

router.post('/api/set-contract-type-active', async (req, res) => {
  const { uuid, active } = req.body;
  if (typeof uuid !== 'string'
    || typeof active !== 'boolean') {
    res.json({ error: 'Invalid request.' });
    return;
  }
  try {
    const success = await InsurancePeer.setActiveContractType(
      uuid, active);
    res.json({ success });
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

router.post('/api/blocks', async (req, res) => {
  const { noOfLastBlocks } = req.body;
  if (typeof noOfLastBlocks !== 'number') {
    res.json({ error: 'Invalid request' });
  }
  try {
    const blocks = await InsurancePeer.getBlocks(noOfLastBlocks);
    res.json(blocks);
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

router.get('*', (req, res) => {
  res.render('contract-management', {
    contractManagementActive: true,
    claimProcessingActive: req.originalUrl.includes('claim-processing'),
    contractTemplatesActive: req.originalUrl.includes('contract-templates')
  });
});

function wsConfig(io) {
  InsurancePeer.on('block', block => {
    io.emit('block', block);
  });
}

export default router;
export { wsConfig };
