function generateUniqueToken() {
    const randomStr = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now();
    return `supa_${randomStr}_${timestamp}`;
}

// 1. COMPOSE BOX SPY (Badge aur Pixel Lagane Ke Liye)
const spy = new MutationObserver((mutations) => {
    const emailBody = document.querySelector('.Am.Al.editable'); 
    if (emailBody && !emailBody.hasAttribute('data-supa-tracked')) {
        emailBody.setAttribute('data-supa-tracked', 'true'); 
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

        const trackingPixel = document.createElement('img');
        trackingPixel.className = 'supa-invisible-pixel';
        trackingPixel.src = `https://tick-email-tracker.onrender.com/track?id=${emailToken}`; 
        trackingPixel.width = 1;
        trackingPixel.height = 1;
        trackingPixel.style.opacity = '0'; 
        emailBody.appendChild(trackingPixel);
    }

    // Sent Folder UI render hone par ticks lagana
    if (window.location.hash.includes('#sent')) {
        renderDoubleTicks();
    }
});
spy.observe(document.body, { childList: true, subtree: true });

// 2. SEND BUTTON TRAP
document.addEventListener('click', function(event) {
    const sendButton = event.target.closest('div[data-tooltip^="Send"]');
    if (sendButton) {
        const composeBox = sendButton.closest('div[role="dialog"]') || sendButton.closest('.M9') || document;
        const badge = composeBox.querySelector('.supa-tracker-badge');
        let token = badge ? badge.getAttribute('data-token') : null;
        
        let recipient = "Unknown";
        const hiddenInputs = composeBox.querySelectorAll('input[name="to"]');
        hiddenInputs.forEach(input => { if (input.value && input.value.includes('@')) recipient = input.value; });

        if (recipient === "Unknown") {
            const chips = composeBox.querySelectorAll('[data-hovercard-id], [email]');
            for (let chip of chips) {
                let emailVal = chip.getAttribute('data-hovercard-id') || chip.getAttribute('email');
                if (emailVal && emailVal.includes('@')) { recipient = emailVal; break; }
            }
        }

        if (token && recipient !== "Unknown") {
            chrome.runtime.sendMessage({ action: "registerEmail", token: token, recipient: recipient });
        }
    }
});

// 3. SENT FOLDER JADOO: DOUBLE TICKS INJECTOR (NEW)
let isFetchingTicks = false;
function renderDoubleTicks() {
    if (isFetchingTicks) return;
    isFetchingTicks = true;

    chrome.runtime.sendMessage({ action: "getEmails" }, function(response) {
        isFetchingTicks = false;
        if (!response || !response.success || !response.emails) return;

        // Gmail ke saare email rows ko pakarna (.zA class)
        const emailRows = document.querySelectorAll('.zA');
        
        emailRows.forEach(row => {
            // Agar is row par pehle se tick laga hua hai to skip karein
            if (row.querySelector('.tick-status-span')) return;

            const rowText = row.innerText || '';
            
            // Database ki emails mein se check karna ke kya koi token is row ke text mein mojood hai
            const matchedEmail = response.emails.find(email => rowText.includes(email.token));

            if (matchedEmail) {
                // Ticks lagane ke liye ek chota sa element banana
                const tickSpan = document.createElement('span');
                tickSpan.className = 'tick-status-span';
                tickSpan.style.marginRight = '8px';
                tickSpan.style.fontWeight = 'bold';
                tickSpan.style.fontSize = '14px';

                if (matchedEmail.status === 'OPENED') {
                    tickSpan.innerHTML = '✔️✔️'; // Double Tick
                    tickSpan.style.color = '#2ecc71'; // Green color
                    tickSpan.title = `Opened at: ${new Date(matchedEmail.opened_at).toLocaleString()}`;
                } else {
                    tickSpan.innerHTML = '✔️'; // Single Tick
                    tickSpan.style.color = '#95a5a6'; // Gray color
                    tickSpan.title = 'Sent but Unopened';
                }

                // Gmail row mein subject/sender ke bilkul pehle tick ghusana
                const targetInsertLocation = row.querySelector('.yX') || row.querySelector('.yW');
                if (targetInsertLocation) {
                    targetInsertLocation.insertBefore(tickSpan, targetInsertLocation.firstChild);
                }
            }
        });
    });
}

// Jab user folder badle to fauran UI refresh ho
window.addEventListener('hashchange', () => {
    if (window.location.hash.includes('#sent')) {
        setTimeout(renderDoubleTicks, 1000);
    }
});
