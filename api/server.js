const express = require('express');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = process.env.SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY) : {};
if (!initializeApp._apps.length) {
    if (Object.keys(serviceAccount).length > 0) {
        initializeApp({ credential: cert(serviceAccount) });
    }
}
const db = getFirestore();
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

const verifyAuthToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).send({ error: 'Unauthorized.'});
    const idToken = authHeader.split('Bearer ')[1];
    try {
        req.user = await getAuth().verifyIdToken(idToken);
        next();
    } catch (error) {
        return res.status(403).send({ error: 'Forbidden. Invalid token.'});
    }
};

app.post('/api/save-profile', verifyAuthToken, async (req, res) => {
    const { uid, email } = req.user;
    const { brandProfile } = req.body;
    if (!brandProfile) return res.status(400).json({ error: "Invalid brand profile data." });
    try {
        await db.collection('users').doc(uid).set({
            email: email,
            brandProfile: brandProfile,
            subscription: { plan: "free", status: "active" },
            usage: { generationsThisMonth: 0 },
        }, { merge: true });
        res.status(201).json({ message: 'Profile saved.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save profile.' });
    }
});

app.get('/api/get-profile', verifyAuthToken, async (req, res) => {
    const { uid } = req.user;
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (!doc.exists || !doc.data().brandProfile) {
            return res.status(404).json({ message: "Profile not found." });
        }
        res.status(200).json({ brandProfile: doc.data().brandProfile });
    } catch (error) {
        res.status(500).json({ error: "Failed to get profile." });
    }
});

app.post('/api/generate-response', verifyAuthToken, async (req, res) => {
    const { prompt, brandProfile } = req.body;
    if (!brandProfile) return res.status(400).json({ error: "Brand profile is missing." });
    try {
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`;
        const fullPrompt = `You are an AI assistant for a business called "${brandProfile.name}". A user asks: "${prompt}". Provide a helpful response.`;
        const response = await axios.post(GEMINI_API_URL, {
            contents: [{ parts: [{ text: fullPrompt }] }]
        });
        if (!response.data.candidates) throw new Error("Invalid AI API response.");
        res.json({ response: response.data.candidates[0].content.parts[0].text });
    } catch (error) {
        res.status(502).json({ error: "Failed to generate response." });
    }
});

module.exports = app;

