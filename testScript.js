require('dotenv').config();
const axios = require('axios');

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';

async function testClaudeAPI() {
  console.log('API Key (first 5 chars):', CLAUDE_API_KEY.substring(0, 5) + '...');
  console.log('API Key length:', CLAUDE_API_KEY.length);
  console.log('API URL:', CLAUDE_API_URL);

  const payload = {
    model: "claude-3-opus-20240229",
    max_tokens: 1000,
    messages: [
      { role: "user", content: "Hello, Claude! Can you hear me?" }
    ]
  };

  try {
    console.log('Sending request to Claude API...');
    const response = await axios.post(CLAUDE_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
    }
  }
}

testClaudeAPI();