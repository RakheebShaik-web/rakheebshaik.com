// ─── Helpers ───
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

// ─── Boot Sequence ───
const bootLines = [
  'Microsoft(R) Windows 95',
  '(C) Copyright Microsoft Corp 1981-1996.',
  '',
  'C:\\> load rakheeb.exe',
  '',
  'Checking system... OK',
  'Loading trading engine... OK',
  'Connecting to market data... OK',
  'Initializing RakheebOS... OK',
  '',
  'C:\\> rakheeb.exe',
];

function runBoot() {
  const el = $('#boot-lines');
  let i = 0;
  const skip = () => {
    document.removeEventListener('keydown', skip);
    document.removeEventListener('click', skip);
    el.innerHTML = bootLines.join('\n');
    setTimeout(finishBoot, 300);
  };
  document.addEventListener('keydown', skip);
  document.addEventListener('click', skip);

  function typeLine() {
    if (i >= bootLines.length) { setTimeout(finishBoot, 600); return; }
    el.innerHTML += bootLines[i] + '\n';
    i++;
    setTimeout(typeLine, 80 + Math.random() * 60);
  }
  typeLine();
}

function finishBoot() {
  const bs = $('#boot-screen');
  bs.style.opacity = '0';
  bs.style.transition = 'opacity .3s';
  setTimeout(() => {
    bs.style.display = 'none';
    $('#app').style.display = '';
    initDesktop();
  }, 300);
}

// ─── Desktop & Window Manager ───
function initDesktop() {
  const icons = $$('.desk-icon');
  const chatWindow = $('#chat-window');
  let messages = [];
  let isTyping = false;
  let inited = false;

  // Open window
  $('#icon-open').addEventListener('click', () => openWindow());
  $('#btn-close').addEventListener('click', closeWindow);
  $('#btn-minimize').addEventListener('click', closeWindow);



  function openWindow(cmd) {
    chatWindow.style.display = 'flex';
    chatWindow.classList.add('active');
    $('#desktop-icons').classList.add('hidden');
    if (!inited) { inited = true; renderChips(); }
    if (cmd) setTimeout(() => sendCommand(cmd), 400);
    else if (messages.length === 0) showWelcome();
  }

  function closeWindow() {
    chatWindow.style.display = 'none';
    chatWindow.classList.remove('active');
    $('#desktop-icons').classList.remove('hidden');
  }

  // ─── Menu Bar ───
  let openMenu = null;
  const menus = {
    'menu-file': [
      { label: 'New Chat', action: resetChat },
      { label: 'Print...', action: () => window.print() },
      { sep: true },
      { label: 'Exit', action: closeWindow },
    ],
    'menu-view': [
      { label: 'GitHub ↗', action: () => window.open('https://github.com/RakheebShaik-web', '_blank') },
      { label: 'LinkedIn ↗', action: () => window.open('https://www.linkedin.com/in/rakheeb-shaik-aba0762b5/', '_blank') },
    ],
    'menu-help': [
      { label: 'Type /help for commands', action: () => {} },
    ],
  };

  $$('.menu-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.id;
      closeMenus();
      if (openMenu === id) { openMenu = null; return; }
      openMenu = id;
      btn.classList.add('menu-item-open');
      const dd = document.createElement('div');
      dd.className = 'menu-dropdown';
      dd.id = 'active-dropdown';
      menus[id].forEach(item => {
        if (item.sep) {
          dd.innerHTML += '<div class="menu-dropdown-sep"></div>';
        } else {
          const b = document.createElement('button');
          b.className = 'menu-dropdown-item';
          b.textContent = item.label;
          b.addEventListener('click', (ev) => { ev.stopPropagation(); closeMenus(); item.action(); });
          dd.appendChild(b);
        }
      });
      btn.closest('.menu-item-wrap').appendChild(dd);
      requestAnimationFrame(() => dd.classList.add('open'));
    });
  });

  function closeMenus() {
    $$('.menu-item').forEach(m => m.classList.remove('menu-item-open'));
    const dd = $('#active-dropdown');
    if (dd) {
      dd.classList.remove('open');
      setTimeout(() => { if (dd.parentNode) dd.remove(); }, 160);
    }
  }

  document.addEventListener('click', closeMenus);

  // ─── Easter Egg: double-click "2003" ───
  let lastClick = 0;
  $('#status-year').addEventListener('click', () => {
    const now = Date.now();
    if (now - lastClick < 400) showEasterEgg();
    lastClick = now;
  });

  function showEasterEgg() {
    const overlay = document.createElement('div');
    overlay.className = 'egg-overlay';
    overlay.innerHTML = `
      <div class="egg-window">
        <div class="title-bar">
          <span class="title-bar-text">rakheeb_2003.bmp</span>
          <div class="title-bar-controls">
            <button class="title-btn" id="egg-close">✕</button>
          </div>
        </div>
        <div class="egg-body">
          <div class="egg-ascii">
    .-"""-.
   /        \\
  |  O    O  |
  |    __    |
  |   /  \\   |
   \\  \\__/  /
    '-.  .-'
       ||
       ||</div>
          <div class="egg-text">Yo! You found me.</div>
          <div class="egg-sub">Still grinding. Still building.</div>
        </div>
      </div>`;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.id === 'egg-close') overlay.remove();
    });
    chatWindow.appendChild(overlay);
  }

  // ─── Commands ───
  const commands = {
    '/about': {
      desc: 'Who is Rakheeb',
      response: () => [
        { type: 'divider', text: 'ABOUT' },
        { type: 'text', text: "I'm Rakheeb Shaikh — an algorithmic trader and quant developer based in Hyderabad, India." },
        { type: 'text', text: "I research market ideas and develop automated trading systems that handle screening, risk, execution, and monitoring. My background in Computer Science and AI gives me the technical foundation to turn trading ideas into reliable systems." },
        { type: 'text', text: "I build systematic trading systems across U.S. equities and Indian options — strategies researched from data, engineered with risk first, and deployed with disciplined execution." },
        { type: 'panel', title: 'Quick Facts', items: [
          { label: 'LOCATION', value: 'Hyderabad, India' },
          { label: 'FOCUS', value: 'Systematic trading & automation' },
          { label: 'MARKETS', value: 'U.S. equities · NSE options' },
          { label: 'EDUCATION', value: 'Computer Science & AI' },
          { label: 'STATUS', value: '🟢 Open to opportunities' },
        ]},
        { type: 'text', text: "Currently building at the intersection of quantitative research, risk engineering, and automated execution. I work across two distinct market structures — U.S. equities and Indian options — and that contrast shapes how I research and engineer systems." },
      ],
    },
    '/systems': {
      desc: 'Trading systems & projects',
      response: () => [
        { type: 'divider', text: 'SYSTEMS' },
        { type: 'text', text: "Here are the trading systems I've built — from live automation to research platforms." },
        { type: 'card', icon: '⚡', tag: 'LIVE AUTOMATION', title: 'Automated U.S. Stock Trading Bot', sub: 'Fully automated pipeline from screening to order management, with exposure caps, duplicate order protection, and auditable live decisions.', url: 'https://github.com/RakheebShaik-web/alpaca.bot-eod-dashboard' },
        { type: 'card', icon: '📊', tag: 'RESEARCH PLATFORM', title: 'Quant Screener', sub: 'Ranks liquid stocks, confirms trend and momentum on completed bars, then sizes every trade using account risk and ATR based invalidation.', url: 'https://github.com/RakheebShaik-web/quant-screener' },
        { type: 'card', icon: '📈', tag: 'RESEARCH · NO LIVE ORDERS', title: 'NSE Options Selling System', sub: 'Researches liquid NSE underlyings and explicit volatility, trend, liquidity, and event risk conditions before a structure is considered.', url: 'https://github.com/RakheebShaik-web/stocks-options-strategy' },
        { type: 'text', text: "Process: Research the edge → Engineer the risk → Automate execution → Measure and refine" },
      ],
    },
    '/stack': {
      desc: 'Tech stack & tools',
      response: () => [
        { type: 'divider', text: 'STACK' },
        { type: 'tools', groups: [
          { cat: 'LANGUAGES', items: ['Python', 'TypeScript', 'Rust', 'C++'] },
          { cat: 'FRAMEWORKS', items: ['React', 'FastAPI'] },
          { cat: 'DATA & INFRA', items: ['PostgreSQL', 'Redis', 'Docker', 'Git'] },
        ]},
      ],
    },
    '/resume': {
      desc: 'Full resume view',
      response: () => [
        { type: 'divider', text: 'RESUME' },
        { type: 'text', text: "RAKHEEB SHAIKH\nAlgorithmic Trader & Quant Developer\nHyderabad, India\n\nshaikrakheeb280@gmail.com\ngithub.com/RakheebShaik-web\nlinkedin.com/in/rakheeb-shaik" },
        { type: 'heading', text: 'SUMMARY' },
        { type: 'text', text: "Quantitative trading systems built from research, tested through data, and deployed with disciplined execution across U.S. equities and Indian options." },
        { type: 'heading', text: 'SYSTEMS' },
        { type: 'text', text: "[01] AUTOMATED U.S. STOCK TRADING BOT — LIVE\nFully automated pipeline from screening to order management. Exposure caps, duplicate order protection, auditable live decisions.\nPython · Alpaca API · Bracket orders · Alerts" },
        { type: 'text', text: "[02] QUANT SCREENER — RESEARCH\nRanks liquid stocks, confirms trend and momentum on completed bars, sizes trades with account risk and ATR invalidation." },
        { type: 'text', text: "[03] NSE OPTIONS SELLING SYSTEM — RESEARCH\nVolatility, trend, liquidity and event-risk filters for premium selling structures on liquid underlyings." },
        { type: 'heading', text: 'STACK' },
        { type: 'text', text: "Python · TypeScript · React · Rust · FastAPI\nPostgreSQL · Redis · Docker · Git · C++" },
      ],
    },
    '/contact': {
      desc: 'Get in touch',
      response: () => [
        { type: 'divider', text: 'CONTACT' },
        { type: 'text', text: "Let's talk:" },
        { type: 'list', items: [
          { icon: '✉️', name: 'shaikrakheeb280@gmail.com', desc: 'EMAIL', url: 'mailto:shaikrakheeb280@gmail.com' },
          { icon: '🐙', name: 'github.com/RakheebShaik-web', desc: 'GITHUB', url: 'https://github.com/RakheebShaik-web' },
          { icon: '💼', name: 'linkedin.com/in/rakheeb-shaik', desc: 'LINKEDIN', url: 'https://www.linkedin.com/in/rakheeb-shaik-aba0762b5/' },
          { icon: '📍', name: 'Hyderabad, India (IST)', desc: 'LOCATION', url: null },
        ]},
        { type: 'text', text: "🟢 Open to opportunities — quant development, trading automation, and anything where careful engineering meets markets." },
      ],
    },
    '/help': {
      desc: 'Available commands',
      response: () => [
        { type: 'divider', text: 'COMMANDS' },
        { type: 'text', text: "Available commands:\n\n/about    — Who I am\n/systems  — Trading systems\n/stack    — Tech stack\n/resume   — Full resume\n/contact  — Get in touch\n/help     — This message" },
      ],
    },
  };

  // ─── Welcome ───
  async function showWelcome() {
    const msgs = [
      "Hey there 👋",
      "I'm Rakheeb Shaikh",
      "I build automated trading systems",
      "Algorithmic Trader · Quant Developer · Hyderabad, India",
      "Type a command below or tap one to explore ↓",
    ];
    for (let i = 0; i < msgs.length; i++) {
      // Show blinking cursor
      const cur = document.createElement('div');
      cur.className = 'msg-row msg-visible';
      cur.id = 'welcome-cursor';
      cur.innerHTML = '<div class="msg-bubble msg-sys typing-bubble"><span class="typing-cursor"></span></div>';
      $('#messages').appendChild(cur);
      scrollBottom();

      await new Promise(r => setTimeout(r, 700));

      // Remove cursor, show message
      cur.remove();
      addMessage('system', 'rakheeb.exe', [msgs[i]]);
      await new Promise(r => setTimeout(r, 500));
    }
  }

  function resetChat() {
    messages = [];
    $('#messages').innerHTML = '';
    isTyping = false;
    showWelcome();
  }

  // ─── Message Rendering ───
  function addMessage(role, handle, parts) {
    const row = document.createElement('div');
    row.className = `msg-row ${role === 'user' ? 'msg-user' : 'msg-sys'}`;
    row.innerHTML = `<span class="msg-handle">${handle}</span>`;
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${role === 'user' ? 'msg-usr' : 'msg-sys'}`;
    bubble.innerHTML = parts.map(p => typeof p === 'string' ? p.replace(/\n/g, '<br>') : p).join('<br><br>');
    row.appendChild(bubble);
    const ts = document.createElement('span');
    ts.className = 'timestamp';
    ts.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/^0/, '');
    row.appendChild(ts);
    $('#messages').appendChild(row);
    requestAnimationFrame(() => row.classList.add('msg-visible'));
    scrollBottom();
    messages.push({ role, handle, parts });
  }

  function addDivider(text) {
    const d = document.createElement('div');
    d.className = 'msg-divider';
    d.innerHTML = `<span class="divider-icon">◆</span><span>${text}</span><span class="divider-line"></span>`;
    $('#messages').appendChild(d);
    requestAnimationFrame(() => d.classList.add('msg-visible'));
  }

  function addCard(icon, tag, title, sub, url) {
    const row = document.createElement('div');
    row.className = 'card-grid';
    const card = document.createElement('button');
    card.className = 'win-card';
    card.innerHTML = `
      <span class="win-card-icon">${icon}</span>
      <div class="win-card-body">
        <span class="win-card-tag">${tag}</span>
        <span class="win-card-title">${title}</span>
        <span class="win-card-sub">${sub}</span>
      </div>`;
    if (url) card.addEventListener('click', () => window.open(url, '_blank'));
    row.appendChild(card);
    $('#messages').appendChild(row);
    scrollBottom();
  }

  function addList(items) {
    const list = document.createElement('div');
    list.className = 'win-list';
    items.forEach(item => {
      const row = document.createElement('a');
      row.className = 'win-list-row';
      if (item.url) { row.href = item.url; row.target = '_blank'; row.rel = 'noopener noreferrer'; }
      row.innerHTML = `
        <span class="win-list-icon">${item.icon}</span>
        <div class="win-list-info">
          <span class="win-list-name">${item.name}</span>
          <span class="win-list-desc">${item.desc}</span>
        </div>
        ${item.url ? '<span class="win-list-arrow">↗</span>' : ''}`;
      list.appendChild(row);
    });
    $('#messages').appendChild(list);
    scrollBottom();
  }

  function addPanel(title, items) {
    const panel = document.createElement('div');
    panel.className = 'win-panel';
    panel.innerHTML = `
      <div class="win-panel-bar"><span class="win-panel-bar-icon">📋</span>${title}</div>
      <div class="win-panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${items.map(i => `<div style="background:#c0c0c0;padding:8px 10px;box-shadow:inset -1px -1px 0 #808080,inset 1px 1px 0 #fff">
          <small style="display:block;font-size:9px;letter-spacing:1.2px;color:#777;margin-bottom:3px;font-family:'IBM Plex Mono',monospace">${i.label}</small>
          <strong style="font-size:12px;font-family:'IBM Plex Mono',monospace">${i.value}</strong>
        </div>`).join('')}
      </div>`;
    $('#messages').appendChild(panel);
    scrollBottom();
  }

  function addTools(groups) {
    const wrapper = document.createElement('div');
    wrapper.className = 'win-panel';
    wrapper.style.marginBottom = '6px';
    let html = '';
    groups.forEach(g => {
      html += `<div class="tools-group"><span class="tools-cat">${g.cat}</span><div class="tools-items">`;
      g.items.forEach(i => { html += `<span class="tool-chip">${i}</span>`; });
      html += '</div></div>';
    });
    wrapper.innerHTML = `<div class="win-panel-body">${html}</div>`;
    $('#messages').appendChild(wrapper);
    scrollBottom();
  }

  function addHeading(text) {
    const h = document.createElement('div');
    h.style.cssText = "font-family:'VT323',monospace;font-size:15px;color:#000080;margin:8px 0 4px;letter-spacing:1px";
    h.textContent = text;
    $('#messages').appendChild(h);
    scrollBottom();
  }

  // ─── Chips ───
  function renderChips() {
    const chips = $('#chips');
    chips.innerHTML = '';
    Object.entries(commands).forEach(([cmd]) => {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.textContent = cmd;
      btn.style.animationDelay = `${Math.random() * 0.2}s`;
      btn.addEventListener('click', () => sendCommand(cmd));
      chips.appendChild(btn);
    });
  }

  function scrollBottom() {
    const el = $('#messages');
    setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
  }

  // ─── Send Command ───
  async function sendCommand(cmd) {
    if (isTyping) return;
    const data = commands[cmd];
    if (!data) {
      addMessage('user', '> You', [cmd]);
      addMessage('system', 'rakheeb.exe', [`Unknown command: ${cmd}. Type /help for available commands.`]);
      return;
    }

    addMessage('user', '> You', [cmd]);
    isTyping = true;

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'msg-row msg-visible';
    typing.innerHTML = `<span class="msg-handle">rakheeb.exe</span><div class="msg-bubble msg-sys typing-bubble"><span class="typing-cursor"></span><span class="typing-cursor" style="animation-delay:.15s"></span><span class="typing-cursor" style="animation-delay:.3s"></span></div>`;
    $('#messages').appendChild(typing);
    scrollBottom();

    await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
    typing.remove();

    const parts = data.response();
    for (const part of parts) {
      if (part.type === 'divider') addDivider(part.text);
      else if (part.type === 'text') addMessage('system', 'rakheeb.exe', [part.text]);
      else if (part.type === 'card') addCard(part.icon, part.tag, part.title, part.sub, part.url);
      else if (part.type === 'list') addList(part.items);
      else if (part.type === 'panel') addPanel(part.title, part.items);
      else if (part.type === 'tools') addTools(part.groups);
      else if (part.type === 'heading') addHeading(part.text);
      await new Promise(r => setTimeout(r, 200));
    }

    isTyping = false;
  }

  // ─── Input ───
  const form = $('#chat-form');
  const input = $('#chat-input');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    closeSugg();
    if (val.startsWith('/')) sendCommand(val);
    else {
      const match = Object.keys(commands).find(c => c.startsWith(val.toLowerCase()));
      if (match) sendCommand(match);
      else sendCommand(val);
    }
  });

  // ─── Autocomplete Suggestions ───
  input.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    if (!val || val.length < 1) { closeSugg(); return; }

    const matches = Object.entries(commands).filter(([cmd, data]) =>
      cmd.includes(val) || data.desc.toLowerCase().includes(val)
    );
    if (matches.length === 0) { closeSugg(); return; }

    const popup = $('#sugg-popup');
    popup.innerHTML = '';
    popup.className = 'sugg-popup open';
    matches.forEach(([cmd, data]) => {
      const row = document.createElement('button');
      row.className = 'sugg-row';
      row.innerHTML = `<span class="sugg-cmd">${cmd}</span><span class="sugg-desc">${data.desc}</span>`;
      row.addEventListener('click', () => { input.value = ''; closeSugg(); sendCommand(cmd); });
      popup.appendChild(row);
    });
  });

  function closeSugg() {
    const p = $('#sugg-popup');
    if (p) { p.innerHTML = ''; p.className = 'sugg-popup'; }
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.input-area')) closeSugg();
  });
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', runBoot);
