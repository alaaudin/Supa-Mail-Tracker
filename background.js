chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Action 1: Email Register Karna
    if (message.action === "registerEmail") {
        fetch('https://tick-email-tracker.onrender.com/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: message.token, recipient: message.recipient })
        })
        .then(res => res.json())
        .then(data => sendResponse({ success: true, data }))
        .catch(err => sendResponse({ success: false, error: err.message }));
        return true; 
    }

    // Action 2: Saari Emails Ka Status Mangwana (NEW)
    if (message.action === "getEmails") {
        fetch('https://tick-email-tracker.onrender.com/emails')
        .then(res => res.json())
        .then(data => sendResponse(data))
        .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }
});
