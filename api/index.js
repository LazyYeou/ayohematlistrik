const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
try {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
} catch (e) {
    // ignore
}
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Kamu adalah EcoBot, asisten AI ahli dalam efisiensi energi. Jawablah pertanyaan pengguna dengan ramah, singkat, dan informatif dalam Bahasa Indonesia." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Halo! Saya EcoBot. Saya siap membantu Anda menghemat energi dan menjaga bumi." }],
                },
                
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Maaf, AI sedang sibuk." });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;