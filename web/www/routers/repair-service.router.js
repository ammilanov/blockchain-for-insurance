import express from 'express';
import * as RepairServicePeer from '../blockchain/repairServicePeer';

const router = express.Router();

router.post('/api/repair-orders', async (req, res) => {
  try {
    let repairOrders = await RepairServicePeer.getRepairOrders();
    res.json(repairOrders);
  } catch (e) {
    console.log(e);
    res.json({ error: "Error accessing blockchain."});
  }
});

router.post('/api/complete-repair-order', async (req, res) => {
  const { uuid } = req.body;
  if (typeof uuid !== 'string') {
    res.json({ error: "Invalid request." });
    return;
  }

  try {
    await RepairServicePeer.completeRepairOrder(uuid);
    json.res({ success: true });
  } catch (e) {
    console.log(e);
    res.json({ error: "Error accessing blockchain." });
  }
});

router.get('*', (req, res) => {
  res.render('repair-service', { repairServiceActive: true });
});

export default router;
