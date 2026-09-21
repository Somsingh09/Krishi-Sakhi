// chatController.js
exports.handleChat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({ 
                success: false, 
                message: 'API key is not configured. Please add GEMINI_API_KEY to your .env file.' 
            });
        }

        const projectId = "776422998054"; // Updated project number from user
        const region = "us-central1"; // Defaulting to us-central1
        const model = "gemini-1.5-flash";
        const apiKey = process.env.GEMINI_API_KEY;

        const url = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${model}:generateContent?key=${apiKey}`;

        const prompt = `You are Krishi Sakhi, a helpful AI assistant for farmers in India. 
        You provide assistance regarding weather, crop diseases, market prices (mandi bhav), and government schemes.
        Please reply in the language the user speaks (English or Hindi). Be concise and helpful.
        User's message: ${message}`;

        // Send a direct REST request to Vertex AI
        const fetch = (await import('node-fetch')).default || globalThis.fetch; 
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Vertex AI Error:', data);
            
            if (data.error && data.error.code === 403) {
                 if (data.error.message.includes('billing')) {
                     return res.status(403).json({ 
                         success: false, 
                         message: 'Google Cloud requires a Billing Account to use Vertex AI. Please enable billing for project 776422998054.'
                     });
                 }
                 return res.status(403).json({ 
                     success: false, 
                     message: 'Google Cloud API is disabled. Please enable "Vertex AI API" in your Google Cloud Console for project 776422998054.'
                 });
            }
            return res.status(500).json({ success: false, message: 'Failed to communicate with Vertex AI' });
        }

        const replyText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ success: true, reply: replyText });
        
    } catch (error) {
        console.error('Error in chat processing:', error);
        res.status(500).json({ success: false, message: 'Failed to process chat message' });
    }
};

