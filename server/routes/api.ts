import { Router } from 'express';
import { mondayService } from '../services/mondayService.js';
import { agentService } from '../services/agentService.js';
import { normalizationService } from '../services/normalizationService.js';
import { analyticsService } from '../services/analyticsService.js';

const router = Router();

// 1. Process Natural Language Query
router.post('/chat', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query string is required' });
      return;
    }
    const response = await agentService.processQuery(query);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to process BI query',
      details: err.message
    });
  }
});

// 2. Get Connection Status (NO TOKENS RETURNED)
router.get('/monday/status', async (req, res) => {
  try {
    let status = mondayService.getStatus();
    // If not yet connected, attempt refresh to verify credentials loaded from env
    if (!status.isMondayConnected && process.env.MONDAY_API_TOKEN) {
      status = await mondayService.refreshData();
    }
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve connection status', details: err.message });
  }
});

// 3. Trigger Data Refresh
router.post('/monday/refresh', async (req, res) => {
  try {
    const status = await mondayService.refreshData();
    res.json({ message: 'Data refreshed successfully', status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to refresh Monday data', details: err.message });
  }
});

// 4. Get Leadership Brief Directly
router.get('/leadership-brief', async (req, res) => {
  try {
    const response = await agentService.processQuery('Prepare a leadership update.');
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate Leadership Brief', details: err.message });
  }
});

// 5. Get Data Quality Audit Report
router.get('/data-quality', (req, res) => {
  try {
    const deals = normalizationService.normalizeDeals(mondayService.getRawDeals());
    const workOrders = normalizationService.normalizeWorkOrders(mondayService.getRawWorkOrders());
    const dqReport = normalizationService.auditDataQuality(deals, workOrders);
    res.json(dqReport);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate Data Quality audit', details: err.message });
  }
});

export default router;
