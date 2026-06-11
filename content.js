function generateUniqueToken() {
    const randomStr = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now();
    return `supa_${randomStr}_${timestamp}`;
}

const spy = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { 
                const emailBody = node.querySelector('.Am.Al.editable'); 
                
                if (emailBody) {
                    if (!emailBody.querySelector('.supa-tracker-badge')) {
                        const emailToken = generateUniqueToken();
                        const badge = document.createElement('div');
                        badge.className = 'supa-tracker-badge';
                        badge.setAttribute('data-token', emailToken); 
                        
                        badge.innerHTML = `
                            <div style="font-family: Arial, sans-serif; font-size: 12px; color: #2ecc71; margin-top: 15px; padding-top: 5px; border-top: 1px dashed #ccc; display: flex; align-items: center; gap: 5px;">
                                <span>🟢</span> <b>Tick Mail Tracker:</b> Active | <span style="color: #7f8c8d; font-size: 10px;">ID: ${emailToken}</span>
                            </div>
                        `;
                        emailBody.appendChild(badge);
                    }
                }
            }
        });
    });
});

spy.observe(document.body, { childList: true, subtree: true });

// SEND BUTTON TRAP
document.addEventListener('click', function(event) {
    const sendButton = event.target.closest('div[data-tooltip^="Send"]');
    
    if (sendButton) {
        const composeBox = sendButton.closest('div[role="dialog"]') || sendButton.closest('.M9') || document;
        const badge = composeBox.querySelector('.supa-tracker-badge');
        let token = "Token nahi mila";
        let emailBody = null;
        
        if (badge) {
            token = badge.getAttribute('data-token');
            emailBody = badge.parentElement;
        }
        
        let recipient = "Unknown";
        const hiddenInputs = composeBox.querySelectorAll('input[name="to"]');
        hiddenInputs.forEach(input => {
            if (input.value && input.value.includes('@')) { recipient = input.value; }
        });

        if (recipient === "Unknown") {
            const chips = composeBox.querySelectorAll('[data-hovercard-id], [email]');
            for (let chip of chips) {
                let emailVal = chip.getAttribute('data-hovercard-id') || chip.getAttribute('email');
                if (emailVal && emailVal.includes('@')) { recipient = emailVal; break; }
            }
        }

        // 1. ASLI JAADU: SERVER PAR DATA REGISTER KARNA
        if (token !== "Token nahi mila" && recipient !== "Unknown") {
            fetch('https://supa-mail-tracker.onrender.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, recipient: recipient })
            })
            .then(res => res.json())
            .then(data => console.log("Server Response:", data))
            .catch(err => console.error("Server par data bhejne mein error:", err));
        }

        // 2. INVISIBLE PIXEL INJECT KARNA
        if (emailBody && !emailBody.querySelector('.supa-invisible-pixel')) {
            const trackingPixel = document.createElement('img');
            trackingPixel.className = 'supa-invisible-pixel';
            trackingPixel.src = `https://supa-mail-tracker.onrender.com/track?id=${token}`; 
            trackingPixel.width = 1;
            trackingPixel.height = 1;
            trackingPixel.style.display = 'none'; 
            emailBody.appendChild(trackingPixel);
        }
    }
});
