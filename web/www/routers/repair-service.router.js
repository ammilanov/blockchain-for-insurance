import express from 'express';

const router = express.Router();

router.get('*', (req, res) => {
  res.render('repair-service', { repairServiceActive: true });
});

export default router;
