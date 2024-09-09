const express = require('express');
const path = require('path');
const multer = require('multer');
const pdf = require('pdf-parse');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 3000;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';

app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the analysis result page at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'analysis_result.html'));
});

async function extractTextFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
}

async function analyzeWithClaude(text) {
    const prompt = `
        Please analyze the following text extracted from a pitch deck or fundraising document.
        Extract and summarize the following information:
        1. Company Overview
        2.Team information
        3. Problem statement
        4. How they are solving this problem
        5. Traction and how much has been built out - revenue numbers.
        6. Business model how they are making money
        7. Market size 
        8. Competitors to this product
        9. Go to market 
        10. Product roadmap
        11. Investment risks
        12.  Funding round details

        Here's the text:
        ${text}

        Please provide a concise summary of the project description, focusing on the points mentioned above.
    `;

    const payload = {
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: [
            { role: "user", content: prompt }
        ]
    };

    try {
        console.log('Calling Claude API...');
        const response = await axios.post(CLAUDE_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            }
        });

        console.log('Received response from Claude API');
        return response.data.content[0].text;
    } catch (error) {
        console.error('Error calling Claude API:', error.message);
        if (error.response) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

app.post('/analyze-pdf', upload.single('pdf'), async (req, res) => {
    console.log('Received POST request to /analyze-pdf');
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded.' });
        }

        console.log('Extracting text from PDF...');
        const text = await extractTextFromPDF(req.file.path);

        console.log('Analyzing text with Claude API...');
        const analysis = await analyzeWithClaude(text);

        // Clean up: delete the uploaded file
        fs.unlinkSync(req.file.path);

        console.log('Analysis complete');
        res.json({ analysis });
    } catch (error) {
        console.error('Error in /analyze-pdf route:', error.message);
        // Clean up: delete the uploaded file if it exists
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'An error occurred while processing the PDF.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Claude API URL: ${CLAUDE_API_URL}`);
    console.log(`Claude API Key: ${CLAUDE_API_KEY ? 'Set' : 'Not set'}`);
});