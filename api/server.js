// AI Employee Backend Server - PRODUCTION VERSION for VERCEL

const express = require('express');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({limit: '10mb'})); // Increase limit for potential logo uploads

// --- Robust Firebase Initialization for Serverless ---
let db;
try {
    const serviceAccountString = process.env.SERVICE_ACCOUNT_KEY;
    if (serviceAccountString && !getApps().length) {
        const serviceAccount = JSON.parse(serviceAccountString);
        initializeApp({ credential: cert(serviceAccount) });
        db = getFirestore();
        console.log("Firebase Admin SDK Initialized.");
    } else if (getApps().length) {
        db = getFirestore();
    } else {
        console.warn("Firebase SDK not initialized: SERVICE_ACCOUNT_KEY missing.");
    }
} catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
}

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// --- Authentication Middleware ---
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

// --- API Endpoints ---
app.post('/api/create-user', verifyAuthToken, async (req, res) => {
    const { uid, email } = req.user;
    try {
        await db.collection('users').doc(uid).set({
            email: email,
            createdAt: new Date().toISOString()
        });
        res.status(201).json({ message: 'User document created.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user document.' });
    }
});

app.post('/api/save-profile', verifyAuthToken, async (req, res) => {
    const { uid } = req.user;
    const { brandProfile } = req.body;
    if (!brandProfile) return res.status(400).json({ error: "Invalid data." });
    try {
        await db.collection('users').doc(uid).set({ brandProfile }, { merge: true });
        res.status(200).json({ message: 'Profile saved.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save profile.' });
    }
});

app.get('/api/get-profile', verifyAuthToken, async (req, res) => {
    if (!db) return res.status(503).json({ error: "Database service unavailable." });
    const { uid } = req.user;
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (!doc.exists) return res.status(404).json({ message: "User document not found." });
        res.status(200).json(doc.data().brandProfile);
    } catch (error) {
        res.status(500).json({ error: "Failed to get user profile." });
    }
});

app.post('/api/generate-campaign', verifyAuthToken, async (req, res) => {
    const { userGoal, brandProfile } = req.body;
    if (!brandProfile) return res.status(400).json({ error: "Brand profile is missing." });
    
    const systemPrompt = `You are 'Astra,' an expert social media marketing strategist. Your task is to generate a complete mini-campaign. Decide if a single 'image', 'video', or a 'carousel' is best. Return a single, valid JSON object. For 'image' or 'video': {"campaignTitle": string, "contentType": "image" | "video", "content": {"prompt": string, "overlayText": string}, "captions": [...]}. For 'carousel': {"campaignTitle": string, "contentType": "carousel", "content": [{"prompt": string, "overlayText": string}, ...], "captions": [...]}. The 'prompt' is for the media generator. 'overlayText' is a short, punchy headline. Generate 3 captions.`;
    const userPrompt = `Business Name: ${brandProfile.name}\nIndustry: ${brandProfile.industry}\nUser's Goal: ${userGoal}`;

    try {
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`;
        const response = await axios.post(GEMINI_API_URL, {
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { "response_mime_type": "application/json" }
        });
        const campaignData = JSON.parse(response.data.candidates[0].content.parts[0].text);
        res.json(campaignData);
    } catch (error) {
        res.status(502).json({ error: "Failed to generate campaign plan." });
    }
});

// Add other endpoints like /api/brainstorm, /api/plan-week if needed, following the same pattern.

module.exports = app;

