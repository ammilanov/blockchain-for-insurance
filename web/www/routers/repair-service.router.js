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
    res.json({ success: true });
  } catch (e) {
    console.log(e);
    res.json({ error: "Error accessing blockchain." });
  }
});

router.post('/api/blocks', async (req, res) => {
  const { noOfLastBlocks } = req.body;
  if (typeof noOfLastBlocks !== 'number') {
    res.json({ error: 'Invalid request' });
  }
  try {
    const blocks = await RepairServicePeer.getBlocks(noOfLastBlocks);
    res.json(blocks);
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

router.get('*', (req, res) => {
  res.render('repair-service', { repairServiceActive: true });
});

function wsConfig(io) {
  RepairServicePeer.on('block', block => { io.emit('block', block); });
}

export default router;
export { wsConfig };
