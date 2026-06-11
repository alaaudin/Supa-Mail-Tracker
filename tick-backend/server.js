const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json()); // Server ko JSON data samajhne ke liye

// 🔴 YAHAN APNI SUPABASE KI DETAILS DALO
const SUPABASE_URL = 'https://xariflrbikemyqjrweem.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcmlmbHJiaWtlbXlxanJ3ZWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTExNDUwOSwiZXhwIjoyMDk2NjkwNTA5fQ.yGZ0VwRuibXSuDF1-_lqmVlRTcAbfv8fSkGRn6fS5DM'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 1. REGISTER ENDPOINT (Extension jab email bhejegi)
// ==========================================
app.post('/register', async (req, res) => {
    const { token, recipient } = req.body;

    console.log(`\n📩 Extension se naya email aaya save karne ke liye...`);
    console.log(`👉 To: ${recipient} | Token: ${token}`);

    // Database (Supabase) mein naya row insert karna
    const { data, error } = await supabase
        .from('tracked_emails')
        .insert([{ token: token, recipient: recipient, status: 'UNOPENED' }]);

    if (error) {
        console.error("❌ Database mein save nahi hua:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }

    console.log("✅ Email successfully database mein save ho gaya!");
    res.json({ success: true });
});

// ==========================================
// 2. TRACK ENDPOINT (SaaS Level Smart Filtering)
// ==========================================
app.get('/track', async (req, res) => {
    const tokenId = req.query.id;
    const userAgent = req.headers['user-agent'] || '';

    console.log(`\n🔍 Tracking Request Aayi Hai...`);
    console.log(`👉 User-Agent: ${userAgent}`);

    // CHECK: Agar request Gmail ke proxy se aayi hai, ya kisi aur device se hai
    // Hum sirf tabhi DB update karenge jab yeh sender ka apna normal Chrome compose window na ho
    const isGmailProxy = userAgent.includes('GoogleImageProxy');
    const isSentFolderHit = userAgent.includes('Chrome') && !isGmailProxy; 

    // Filhal testing ke liye hum check thoda relaxed rakhte hain:
    // Agar Gmail ke zariye khulega to automatic status badle ga
    if (isGmailProxy || !userAgent.includes('Windows NT')) {
        
        console.log(`🚨 REAL OPEN DETECTED! Status updating to OPENED...`);
        
        const { data, error } = await supabase
            .from('tracked_emails')
            .update({ status: 'OPENED', opened_at: new Date().toISOString() })
            .eq('token', tokenId);

        if (error) console.error("❌ DB Update Error:", error.message);
    } else {
        console.log("⚠️ Sender ne khud hi email send/view kiya hai. Database update SKIP kar diya!");
    }

    // 1x1 Transparent Pixel Image wapis bhejna (Image hamesha bhejni hai)
    const pixelBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const imgBuffer = Buffer.from(pixelBase64, 'base64');

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': imgBuffer.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    });
    res.end(imgBuffer);
});

// Render apni marzi ka port deta hai, agar na mile to 3000 use hoga
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Supabase-Connected Server Ready On Port ${PORT}`);
});
