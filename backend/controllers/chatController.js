const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handleChat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({ 
                success: false, 
                message: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.' 
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-1.5-flash as the standard fast text model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are Krishi Sakhi, a helpful AI assistant for farmers in India. 
        You provide assistance regarding weather, crop diseases, market prices (mandi bhav), and government schemes.
        Please reply in the language the user speaks (English or Hindi). Be concise and helpful.
        User's message: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ success: true, reply: text });
    } catch (error) {
        console.error('Error in chat processing:', error);
        res.status(500).json({ success: false, message: 'Failed to process chat message' });
    }
};
