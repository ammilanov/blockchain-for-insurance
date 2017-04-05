import express from 'express';

const router = express.Router();

router.get('*', (req, res) => {
  res.render('contract-management', { contractManagementActive: true });
});

export default router;
