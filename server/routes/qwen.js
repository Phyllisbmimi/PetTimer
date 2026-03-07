const express = require('express');

const router = express.Router();

const DASHSCOPE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';

router.post('/', async (req, res) => {
  try {
    const apiKey = process.env.DASHSCOPE_API_KEY || process.env.VITE_DASHSCOPE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'DASHSCOPE_API_KEY is not configured on server',
      });
    }

    const response = await fetch(DASHSCOPE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (error) {
    console.error('Qwen proxy error:', error);
    return res.status(500).json({
      success: false,
      error: 'Qwen proxy request failed',
    });
  }
});

module.exports = router;
