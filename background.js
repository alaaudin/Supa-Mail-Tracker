chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "registerEmail") {
        // Gmail ke baahir se request bhej rahe hain taaki security block na kare
        fetch('https://tick-email-tracker.onrender.com/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: message.token, recipient: message.recipient })
        })
        .then(res => res.json())
        .then(data => sendResponse({ success: true, data }))
        .catch(err => sendResponse({ success: false, error: err.message }));
        
        return true; // Keep response channel open
    }
});