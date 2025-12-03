// navbar
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('bg-white/90', 'backdrop-blur-md', 'shadow-sm', 'py-3');
        navbar.classList.remove('py-5', 'bg-green-50');
    } else {
        navbar.classList.remove('bg-white/90', 'backdrop-blur-md', 'shadow-sm', 'py-3');
        navbar.classList.add('py-5', 'bg-green-50');
    }
});

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
});


//calc
document.getElementById('calc-btn').addEventListener('click', calculateCarbon);

function calculateCarbon() {
    const items = [
        { watt: 'watt-laptop', hour: 'hour-laptop' },
        { watt: 'watt-lampu', hour: 'hour-lampu' },
        { watt: 'watt-hp', hour: 'hour-hp' },
        { watt: 'watt-rc', hour: 'hour-rc' },
        { watt: 'watt-fan', hour: 'hour-fan' }
    ];

    let totalWhDay = 0;
    items.forEach(item => {
        const w = parseFloat(document.getElementById(item.watt).value) || 0;
        const h = parseFloat(document.getElementById(item.hour).value) || 0;
        totalWhDay += w * h;
    });

    const kwhDay = totalWhDay / 1000;
    const kwhMonth = kwhDay * 30;
    const costMonth = kwhMonth * 1445;
    const carbonFactor = 0.85; 
    const carbonMonth = kwhMonth * carbonFactor;
    const compKm = carbonMonth * 4; 
    const compTree = (carbonMonth * 12) / 22;

    animateValue("res-kwh", 0, kwhMonth.toFixed(1), 1000);
    animateValue("res-cost", 0, costMonth.toLocaleString('id-ID'), 1000);
    animateValue("res-carbon", 0, carbonMonth.toFixed(1), 1000);
    document.getElementById("comp-km").innerText = compKm.toFixed(0);
    document.getElementById("comp-tree").innerText = compTree.toFixed(1);
}

function animateValue(id, start, end, duration) {
    if (start === end) return;
    const obj = document.getElementById(id);
    obj.innerText = end; 
}
calculateCarbon();


//ai
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatContainer = document.getElementById('chat-messages');

function appendMessage(role, text) {
    const isUser = role === 'user';
    const alignClass = isUser ? 'justify-end' : 'justify-start';
    const bgClass = isUser ? 'bg-ecology-600 text-white rounded-l-xl rounded-tr-xl' : 'bg-white border border-slate-200 text-slate-700 rounded-r-xl rounded-tl-xl';
    const avatar = isUser ? '' : `<div class="w-8 h-8 rounded-full bg-ecology-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AI</div>`;

    const safeText = isUser ? text.replace(/</g, "&lt;").replace(/>/g, "&gt;") : text;

    const html = `
        <div class="flex items-start gap-3 ${alignClass} mb-4">
            ${avatar}
            <div class="${bgClass} px-4 py-3 text-sm max-w-[85%] shadow-sm leading-relaxed">
                ${safeText}
            </div>
        </div>
    `;
    
    chatContainer.insertAdjacentHTML('beforeend', html);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTyping() {
    const html = `
        <div id="typing-indicator" class="flex items-start gap-3 mb-4">
            <div class="w-8 h-8 rounded-full bg-ecology-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AI</div>
            <div class="bg-white border border-slate-200 px-4 py-4 rounded-r-xl rounded-tl-xl shadow-sm flex gap-1 items-center h-10">
                <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', html);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

function formatAIResponse(text) {
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
        .replace(/\n/g, '<br>'); 
    formatted = formatted.replace(/(\d+\.)\s+(.*?)(?=<br>|$)/g, '<div class="flex gap-2 mt-1"><span class="font-bold text-ecology-600">$1</span><span>$2</span></div>');
    return formatted;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;

    appendMessage('user', msg);
    chatInput.value = '';
    showTyping();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });

        const data = await response.json();

        removeTyping();
        if(data.reply) {
            appendMessage('ai', formatAIResponse(data.reply));
        } else {
            appendMessage('ai', "Maaf, terjadi kesalahan.");
        }

    } catch (err) {
        console.error(err);
        removeTyping();
        appendMessage('ai', "Maaf, terjadi kesalahan koneksi.");
    }
});