/* =========================================================
   Nasheed & Co — Admin Portal (client-side demo)
   All data persists in localStorage on this device.
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const LS = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (p) => p + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  const fmtDate = (d) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || '');
    if (!m) return d || '—';
    const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return mo[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1];
  };
  const fmtDateTime = (iso) => {
    const dt = new Date(iso);
    if (isNaN(dt)) return iso || '';
    return dt.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  const today = () => new Date().toISOString().slice(0, 10);

  const IMG_BASE = '../assets/img/';
  const IMAGES = ['texture.webp', 'untitled-38.webp', 'img-4610.webp', 'office.webp', 'banner.webp'];
  const CREDS = { user: 'admin', pass: 'nasheed2026' };

  const ICON = {
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.6 6.6C3.6 8.3 2 11 2 11s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="m2 2 20 20"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/></svg>',
    scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-2 1.5-4 1.5-6 0"/><path d="m2 16 3-8 3 8c-2 1.5-4 1.5-6 0"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>'
  };

  /* ---------------- Seeds ---------------- */
  const SEED_INSIGHTS = [
    { id: 'i1', title: 'New Forex Bill in the Maldives: What Businesses Need to Know', category: 'Forex', date: '2024-12-03', excerpt: 'The MMA announced a new Foreign Exchange Bill on 26 November 2024, set to replace the regulation that took effect only weeks earlier. Here’s what it means.', url: 'https://www.nasheeds.co/blog/new-forex-bill-in-the-maldives-what-businesses-need-to-know', img: 'texture.webp', published: true },
    { id: 'i2', title: 'Maldives to Enforce New Seaplane Platform Licensing Regulation', category: 'Regulation', date: '2025-01-27', excerpt: 'A new licensing regime is coming for seaplane platforms. We break down the obligations for operators and what to prepare now.', url: 'https://www.nasheeds.co/news/maldives-to-enforce-new-seaplane-platform-licensing-regulation', img: 'untitled-38.webp', published: true },
    { id: 'i3', title: 'Lease Extension: Development under the 15th Amendment to the Tourism Act', category: 'Tourism', date: '2025-05-26', excerpt: 'What the 15th Amendment means for island lease extensions and resort development — the key provisions in plain terms.', url: 'https://www.nasheeds.co/blog/lease-extension-development-under-the-15th-amendment-to-the-tourism-act', img: 'img-4610.webp', published: true }
  ];
  const SEED_AREAS = [
    ['Corporate Law', 'corporate'], ['Foreign Investment', 'corporate'], ['Hotels, Resorts & Tourism', 'corporate'], ['Banking & Finance', 'corporate'], ['Mergers & Acquisitions', 'corporate'], ['General Commercial', 'corporate'], ['Employment & Labour', 'corporate'], ['Insurance', 'corporate'], ['Tax (GST / TGST)', 'corporate'],
    ['Employment Matters', 'litigation'], ['Debt Recovery & Collection', 'litigation'], ['Injury & Compensation', 'litigation'], ['Family Matters', 'litigation'], ['Intellectual Property', 'litigation'], ['Contractual Disputes', 'litigation'], ['Defamation', 'litigation'], ['Property & Boundary', 'litigation'], ['Judicial Review', 'litigation']
  ].map((a, i) => ({ id: 'a' + (i + 1), name: a[0], group: a[1], enabled: true }));
  const SEED_SETTINGS = { phone: '+960 331 8558', email: 'office@nasheeds.co', address: '3rd Floor, H. Magma, Sikka Goalhi, Malé 20082, Republic of Maldives', linkedin: 'https://www.linkedin.com/company/nasheed-and-co' };
  const SEED_TEAM = [
    { id: 't1', name: 'Ahmed Nasheed', role: 'Managing Partner', bio: 'Founded the firm in 1997. Leads on corporate structuring, foreign investment and resort development for some of the Maldives’ largest enterprises.', tags: ['Corporate', 'Foreign Investment', 'Tourism'], published: true },
    { id: 't2', name: 'Aishath Rasheedha', role: 'Senior Associate · Corporate & Commercial', bio: 'Advises banks, insurers and telecoms on financing, regulatory compliance and high-value commercial contracts and acquisitions.', tags: ['Banking & Finance', 'M&A'], published: true },
    { id: 't3', name: 'Ibrahim Waheed', role: 'Head of Litigation & Disputes', bio: 'Represents clients in contractual, employment and property disputes before the civil courts and in arbitration.', tags: ['Litigation', 'Arbitration'], published: true },
    { id: 't4', name: 'Fathimath Zahaa', role: 'Associate · Regulatory & Employment', bio: 'Focuses on employment matters, GST/TGST and sector regulation for the firm’s aviation and hospitality clients.', tags: ['Employment', 'Tax', 'Aviation'], published: true }
  ];

  function seed() {
    if (LS.get('nc_insights', null) == null) LS.set('nc_insights', SEED_INSIGHTS);
    if (LS.get('nc_areas', null) == null) LS.set('nc_areas', SEED_AREAS);
    if (LS.get('nc_settings', null) == null) LS.set('nc_settings', SEED_SETTINGS);
    if (LS.get('nc_team', null) == null) LS.set('nc_team', SEED_TEAM);
    if (LS.get('nc_enquiries', null) == null) LS.set('nc_enquiries', []);
  }

  /* ---------------- Toast ---------------- */
  let toastT;
  function toast(msg) {
    const el = $('#toast');
    $('#toastMsg').textContent = msg;
    el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ---------------- Auth ---------------- */
  function authed() { return sessionStorage.getItem('nc_admin_auth') === '1'; }
  function showApp() {
    $('#login').classList.add('hidden'); $('#app').classList.remove('hidden');
    const boot = sessionStorage.getItem('nc_boot_view');
    sessionStorage.removeItem('nc_boot_view');
    route(boot && VIEWS[boot] ? boot : 'dashboard');
  }
  function showLogin() { $('#app').classList.add('hidden'); $('#login').classList.remove('hidden'); }

  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = $('#lu').value.trim(), p = $('#lp').value;
    if (u === CREDS.user && p === CREDS.pass) {
      sessionStorage.setItem('nc_admin_auth', '1');
      $('#loginErr').classList.remove('show');
      showApp();
    } else {
      $('#loginErr').classList.add('show');
    }
  });
  $('#logoutBtn').addEventListener('click', () => { sessionStorage.removeItem('nc_admin_auth'); showLogin(); });

  /* ---------------- Router ---------------- */
  const content = $('#viewContent');
  const VIEWS = {
    dashboard: { title: 'Dashboard', sub: 'Overview of your website', render: renderDashboard },
    insights: { title: 'Insights', sub: 'Manage articles shown on the website', render: renderInsights },
    enquiries: { title: 'Enquiries', sub: 'Messages from the website contact form', render: renderEnquiries },
    areas: { title: 'Practice Areas', sub: 'Toggle and edit the areas you list', render: renderAreas },
    team: { title: 'Our Team', sub: 'Manage the people shown on the website', render: renderTeam },
    settings: { title: 'Settings', sub: 'Firm contact details & demo data', render: renderSettings }
  };
  let current = 'dashboard';
  function route(name) {
    current = name;
    $$('#sideNav .navitem').forEach(b => b.classList.toggle('active', b.dataset.view === name));
    $('#viewTitle').textContent = VIEWS[name].title;
    $('#viewSub').textContent = VIEWS[name].sub;
    content.innerHTML = VIEWS[name].render();
    updateBadges();
    closeDrawer();
  }
  $$('#sideNav .navitem').forEach(b => b.addEventListener('click', () => route(b.dataset.view)));

  function updateBadges() {
    const unread = LS.get('nc_enquiries', []).filter(e => !e.read).length;
    const b = $('#enqBadge');
    if (unread > 0) { b.hidden = false; b.textContent = unread; } else { b.hidden = true; }
  }

  /* ---------------- Dashboard ---------------- */
  function renderDashboard() {
    const posts = LS.get('nc_insights', []);
    const enq = LS.get('nc_enquiries', []);
    const areas = LS.get('nc_areas', []);
    const pub = posts.filter(p => p.published).length;
    const unread = enq.filter(e => !e.read).length;
    const activeAreas = areas.filter(a => a.enabled).length;

    const recent = enq.slice(0, 4).map(e => `
      <div class="row ${e.read ? '' : 'unread'}">
        ${e.read ? '' : '<span class="row__dot"></span>'}
        <div class="row__main">
          <div class="row__title">${esc(e.name || 'Anonymous')} ${e.organisation ? '· ' + esc(e.organisation) : ''}</div>
          <div class="row__meta"><span>${esc(e.matter || '')}</span><span>${fmtDateTime(e.date)}</span></div>
        </div>
      </div>`).join('') || `<div class="empty" style="padding:28px">${ICON.inbox}<p>No enquiries yet.</p></div>`;

    return `
      <div class="stats">
        ${statCard(ICON.doc, pub, 'Published insights', posts.length + ' total')}
        ${statCard(ICON.mail, unread, 'New enquiries', enq.length + ' total')}
        ${statCard(ICON.scale, activeAreas, 'Active practice areas', areas.length + ' listed')}
        ${statCard(ICON.check, '1997', 'Established', 'Malé, Maldives')}
      </div>
      <div class="dash-grid">
        <div class="panel">
          <div class="panel__head"><h3>Recent enquiries</h3><button class="btn btn--ghost btn--sm" data-act="go-enquiries">View all</button></div>
          <div class="rows">${recent}</div>
        </div>
        <div class="panel">
          <div class="panel__head"><h3>Quick actions</h3></div>
          <div class="panel__body" style="display:flex;flex-direction:column;gap:.7rem">
            <button class="btn btn--gold btn--block" data-act="new-insight">${ICON.plus} New insight</button>
            <button class="btn btn--ghost btn--block" data-act="go-insights">Manage insights</button>
            <button class="btn btn--ghost btn--block" data-act="go-settings">Edit firm details</button>
            <a class="btn btn--ghost btn--block" href="../" target="_blank" rel="noopener">Open live website</a>
          </div>
        </div>
      </div>`;
  }
  function statCard(icon, value, label, sub) {
    return `<div class="statcard"><div class="statcard__ic">${icon}</div><b>${esc(value)}</b><span>${esc(label)} · <em>${esc(sub)}</em></span></div>`;
  }

  /* ---------------- Insights ---------------- */
  function renderInsights() {
    const posts = LS.get('nc_insights', []);
    const rows = posts.map(p => `
      <div class="row">
        <img class="row__thumb" src="${IMG_BASE}${esc(p.img || 'banner.webp')}" alt="" />
        <div class="row__main">
          <div class="row__title">${esc(p.title)}</div>
          <div class="row__meta">
            <span>${esc(p.category || 'Insight')}</span>
            <span>${fmtDate(p.date)}</span>
            <span class="badge ${p.published ? 'badge--ok' : 'badge--draft'}">${p.published ? 'Published' : 'Draft'}</span>
          </div>
        </div>
        <div class="row__actions">
          <button class="iconbtn" title="${p.published ? 'Unpublish' : 'Publish'}" data-act="toggle-insight" data-id="${p.id}">${p.published ? ICON.eyeOff : ICON.eye}</button>
          <button class="iconbtn" title="Edit" data-act="edit-insight" data-id="${p.id}">${ICON.edit}</button>
          <button class="iconbtn iconbtn--danger" title="Delete" data-act="del-insight" data-id="${p.id}">${ICON.trash}</button>
        </div>
      </div>`).join('');

    return `
      <div class="view__head">
        <div><h2>Insights</h2><p>${posts.length} article${posts.length === 1 ? '' : 's'} · these appear in the “Insights” section of the website.</p></div>
        <button class="btn btn--gold" data-act="new-insight">${ICON.plus} Add insight</button>
      </div>
      <div class="panel">
        ${posts.length ? `<div class="rows">${rows}</div>` : emptyState(ICON.doc, 'No insights yet', 'Add your first article to show it on the website.')}
      </div>`;
  }

  /* ---------------- Enquiries ---------------- */
  let enqFilter = 'all';
  function renderEnquiries() {
    let enq = LS.get('nc_enquiries', []);
    const total = enq.length, unread = enq.filter(e => !e.read).length;
    const list = enqFilter === 'new' ? enq.filter(e => !e.read) : enq;
    const rows = list.map(e => `
      <div class="row ${e.read ? '' : 'unread'}">
        ${e.read ? '' : '<span class="row__dot"></span>'}
        <div class="row__main">
          <div class="row__title">${esc(e.name || 'Anonymous')} ${e.organisation ? '<span style="color:var(--muted);font-weight:400">· ' + esc(e.organisation) + '</span>' : ''} ${e.read ? '' : '<span class="badge badge--new">New</span>'}</div>
          <div class="row__meta"><span>${ICON.mail} ${esc(e.email || '')}</span><span>${esc(e.matter || '')}</span><span>${fmtDateTime(e.date)}</span></div>
          ${e.message ? `<div class="enq__msg">${esc(e.message)}</div>` : ''}
        </div>
        <div class="row__actions">
          <button class="iconbtn" title="${e.read ? 'Mark unread' : 'Mark read'}" data-act="toggle-read" data-id="${e.id}">${e.read ? ICON.mail : ICON.check}</button>
          ${e.email ? `<a class="iconbtn" title="Reply by email" href="mailto:${esc(e.email)}?subject=Re:%20Your%20enquiry%20to%20Nasheed%20%26%20Co">${ICON.mail}</a>` : ''}
          <button class="iconbtn iconbtn--danger" title="Delete" data-act="del-enquiry" data-id="${e.id}">${ICON.trash}</button>
        </div>
      </div>`).join('');

    return `
      <div class="view__head">
        <div><h2>Enquiries</h2><p>${total} total · ${unread} new. Submitted via the website contact form (saved on this device).</p></div>
        <div style="display:flex;gap:.5rem">
          <button class="btn ${enqFilter === 'all' ? 'btn--gold' : 'btn--ghost'} btn--sm" data-act="filter-all">All</button>
          <button class="btn ${enqFilter === 'new' ? 'btn--gold' : 'btn--ghost'} btn--sm" data-act="filter-new">New</button>
        </div>
      </div>
      <div class="panel">
        ${list.length ? `<div class="rows">${rows}</div>` : emptyState(ICON.inbox, 'No enquiries here', 'Submit the contact form on the website and it will appear here instantly.')}
      </div>`;
  }

  /* ---------------- Practice areas ---------------- */
  function renderAreas() {
    const areas = LS.get('nc_areas', []);
    const col = (group, label) => {
      const items = areas.filter(a => a.group === group);
      return `<div class="panel">
        <div class="panel__head"><h3>${label}</h3><span class="badge badge--draft">${items.filter(a => a.enabled).length}/${items.length} active</span></div>
        <div class="panel__body">
          ${items.map(a => `
            <div class="area-row ${a.enabled ? '' : 'off'}">
              <label class="switch"><input type="checkbox" data-act="toggle-area" data-id="${a.id}" ${a.enabled ? 'checked' : ''}><span class="switch__track"></span></label>
              <span class="area-row__name">${esc(a.name)}</span>
              <button class="iconbtn iconbtn--danger" title="Remove" data-act="del-area" data-id="${a.id}">${ICON.trash}</button>
            </div>`).join('')}
        </div>
      </div>`;
    };
    return `
      <div class="view__head">
        <div><h2>Practice Areas</h2><p>Enable or disable the areas your firm lists. ${areas.filter(a => a.enabled).length} of ${areas.length} active.</p></div>
      </div>
      <div class="panel" style="margin-bottom:18px">
        <div class="panel__body">
          <form id="areaAddForm" style="display:flex;flex-wrap:wrap;gap:.7rem;align-items:flex-end">
            <div class="field" style="flex:1;min-width:200px;margin:0"><label for="naName">Add a practice area</label><input id="naName" type="text" placeholder="e.g. Data Protection" required></div>
            <div class="field" style="margin:0;min-width:160px"><label for="naGroup">Group</label>
              <select id="naGroup"><option value="corporate">Corporate & Commercial</option><option value="litigation">Litigation & Disputes</option></select>
            </div>
            <button class="btn btn--gold" type="submit">${ICON.plus} Add</button>
          </form>
        </div>
      </div>
      <div class="areas-grid">
        ${col('corporate', 'Corporate & Commercial')}
        ${col('litigation', 'Litigation & Disputes')}
      </div>`;
  }

  /* ---------------- Our Team ---------------- */
  function teamInitials(name) {
    return (String(name || '').trim().split(/\s+/).map(w => w[0] || '').slice(0, 2).join('') || '—').toUpperCase();
  }
  function renderTeam() {
    const team = LS.get('nc_team', []);
    const shown = team.filter(m => m.published).length;
    const cards = team.map(m => `
      <div class="member-row ${m.published ? '' : 'off'}">
        <div class="member-row__av">${esc(teamInitials(m.name))}</div>
        <div class="member-row__main">
          <div class="member-row__name">${esc(m.name)}</div>
          <div class="member-row__role">${esc(m.role || '')}</div>
          ${m.bio ? `<p class="member-row__bio">${esc(m.bio)}</p>` : ''}
          ${(m.tags && m.tags.length) ? `<div class="member-row__tags">${m.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="member-row__actions">
          <label class="switch" title="${m.published ? 'Shown on website' : 'Hidden'}"><input type="checkbox" data-act="toggle-member" data-id="${m.id}" ${m.published ? 'checked' : ''}><span class="switch__track"></span></label>
          <button class="iconbtn iconbtn--danger" title="Remove" data-act="del-member" data-id="${m.id}">${ICON.trash}</button>
        </div>
      </div>`).join('');

    return `
      <div class="view__head">
        <div><h2>Our Team</h2><p>${shown} of ${team.length} shown · these appear in the “Our Team” section of the website.</p></div>
      </div>
      <div class="panel" style="margin-bottom:18px">
        <div class="panel__body">
          <form id="teamAddForm" style="display:flex;flex-wrap:wrap;gap:.7rem;align-items:flex-end">
            <div class="field" style="flex:1;min-width:170px;margin:0"><label for="tmName">Name</label><input id="tmName" type="text" placeholder="e.g. Aishath Ali" required></div>
            <div class="field" style="flex:1;min-width:170px;margin:0"><label for="tmRole">Role / title</label><input id="tmRole" type="text" placeholder="e.g. Associate"></div>
            <div class="field" style="flex:2;min-width:220px;margin:0"><label for="tmBio">Short bio</label><input id="tmBio" type="text" placeholder="One line about them"></div>
            <button class="btn btn--gold" type="submit">${ICON.plus} Add</button>
          </form>
        </div>
      </div>
      <div class="panel">
        ${team.length ? `<div class="member-list">${cards}</div>` : emptyState(ICON.doc, 'No team members yet', 'Add your first team member to show them on the website.')}
      </div>`;
  }

  /* ---------------- Settings ---------------- */
  function renderSettings() {
    const s = LS.get('nc_settings', SEED_SETTINGS);
    return `
      <div class="view__head"><div><h2>Settings</h2><p>Firm contact details used across the site, plus demo-data controls.</p></div></div>
      <div class="panel">
        <div class="panel__head"><h3>Firm details</h3></div>
        <div class="panel__body">
          <form id="settingsForm" class="settings-grid">
            <div class="field__row">
              <div class="field"><label for="sPhone">Phone</label><input id="sPhone" type="text" value="${esc(s.phone)}"></div>
              <div class="field"><label for="sEmail">Email</label><input id="sEmail" type="email" value="${esc(s.email)}"></div>
            </div>
            <div class="field"><label for="sAddr">Office address</label><textarea id="sAddr">${esc(s.address)}</textarea></div>
            <div class="field"><label for="sLinked">LinkedIn URL</label><input id="sLinked" type="url" value="${esc(s.linkedin)}"></div>
            <div><button class="btn btn--gold" type="submit">${ICON.check} Save details</button></div>
          </form>
        </div>
      </div>
      <div class="panel" style="margin-top:18px;border-color:rgba(192,57,43,.25)">
        <div class="panel__head"><h3 style="color:var(--danger)">Demo data</h3></div>
        <div class="panel__body" style="display:flex;flex-wrap:wrap;gap:.7rem;align-items:center">
          <p style="flex:1;min-width:220px;color:var(--muted);font-size:.9rem;margin-right:1rem">Reset content to the original defaults, or clear all stored enquiries. Affects this device only.</p>
          <button class="btn btn--ghost" data-act="reset-content">Reset content to defaults</button>
          <button class="btn btn--danger" data-act="clear-enquiries">Clear all enquiries</button>
        </div>
      </div>`;
  }

  function emptyState(icon, title, msg) {
    return `<div class="empty">${icon}<h3>${esc(title)}</h3><p>${esc(msg)}</p></div>`;
  }

  /* ---------------- Delegated actions (click) ---------------- */
  content.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const act = t.dataset.act, id = t.dataset.id;
    switch (act) {
      case 'go-enquiries': route('enquiries'); break;
      case 'go-insights': route('insights'); break;
      case 'go-settings': route('settings'); break;
      case 'new-insight': openInsightModal(null); break;
      case 'edit-insight': openInsightModal(id); break;
      case 'toggle-insight': mutate('nc_insights', id, p => (p.published = !p.published)); toast('Insight updated'); route(current); break;
      case 'del-insight':
        if (confirm('Delete this insight? This cannot be undone.')) { removeFrom('nc_insights', id); toast('Insight deleted'); route(current); }
        break;
      case 'toggle-read': mutate('nc_enquiries', id, x => (x.read = !x.read)); route(current); break;
      case 'del-enquiry':
        if (confirm('Delete this enquiry?')) { removeFrom('nc_enquiries', id); toast('Enquiry deleted'); route(current); }
        break;
      case 'filter-all': enqFilter = 'all'; route('enquiries'); break;
      case 'filter-new': enqFilter = 'new'; route('enquiries'); break;
      case 'del-area':
        if (confirm('Remove this practice area?')) { removeFrom('nc_areas', id); toast('Area removed'); route(current); }
        break;
      case 'del-member':
        if (confirm('Remove this team member?')) { removeFrom('nc_team', id); toast('Member removed'); route(current); }
        break;
      case 'reset-content':
        if (confirm('Reset insights, team, practice areas and settings to defaults?')) {
          LS.set('nc_insights', SEED_INSIGHTS); LS.set('nc_areas', SEED_AREAS); LS.set('nc_team', SEED_TEAM); LS.set('nc_settings', SEED_SETTINGS);
          toast('Content reset to defaults'); route(current);
        }
        break;
      case 'clear-enquiries':
        if (confirm('Delete ALL stored enquiries?')) { LS.set('nc_enquiries', []); toast('Enquiries cleared'); route(current); }
        break;
    }
  });

  /* Delegated change (toggles + forms) */
  content.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.act === 'toggle-area') {
      mutate('nc_areas', t.dataset.id, a => (a.enabled = t.checked));
      const row = t.closest('.area-row'); if (row) row.classList.toggle('off', !t.checked);
      updateBadges();
    }
    if (t.dataset && t.dataset.act === 'toggle-member') {
      mutate('nc_team', t.dataset.id, m => (m.published = t.checked));
      const row = t.closest('.member-row'); if (row) row.classList.toggle('off', !t.checked);
    }
  });

  /* Delegated submit (add area + settings) */
  content.addEventListener('submit', (e) => {
    if (e.target.id === 'areaAddForm') {
      e.preventDefault();
      const name = $('#naName').value.trim(); if (!name) return;
      const group = $('#naGroup').value;
      const areas = LS.get('nc_areas', []); areas.push({ id: uid('a'), name, group, enabled: true }); LS.set('nc_areas', areas);
      toast('Practice area added'); route('areas');
    }
    if (e.target.id === 'teamAddForm') {
      e.preventDefault();
      const name = $('#tmName').value.trim(); if (!name) return;
      const team = LS.get('nc_team', []);
      team.push({ id: uid('t'), name, role: $('#tmRole').value.trim(), bio: $('#tmBio').value.trim(), tags: [], published: true });
      LS.set('nc_team', team);
      toast('Team member added'); route('team');
    }
    if (e.target.id === 'settingsForm') {
      e.preventDefault();
      LS.set('nc_settings', { phone: $('#sPhone').value.trim(), email: $('#sEmail').value.trim(), address: $('#sAddr').value.trim(), linkedin: $('#sLinked').value.trim() });
      toast('Firm details saved');
    }
  });

  function mutate(key, id, fn) { const arr = LS.get(key, []); const it = arr.find(x => x.id === id); if (it) { fn(it); LS.set(key, arr); } }
  function removeFrom(key, id) { LS.set(key, LS.get(key, []).filter(x => x.id !== id)); }

  /* ---------------- Insight modal ---------------- */
  const modal = $('#modal');
  let editingId = null;
  function openInsightModal(id) {
    editingId = id;
    const post = id ? LS.get('nc_insights', []).find(p => p.id === id) : null;
    $('#modalTitle').textContent = post ? 'Edit insight' : 'New insight';
    $('#modalBody').innerHTML = `
      <div class="field"><label for="mTitle">Title</label><input id="mTitle" type="text" value="${esc(post ? post.title : '')}" placeholder="Headline of the article"></div>
      <div class="field__row">
        <div class="field"><label for="mCat">Category</label><input id="mCat" type="text" value="${esc(post ? post.category : '')}" placeholder="e.g. Forex, Tourism"></div>
        <div class="field"><label for="mDate">Date</label><input id="mDate" type="date" value="${esc(post ? post.date : today())}"></div>
      </div>
      <div class="field"><label for="mExcerpt">Excerpt</label><textarea id="mExcerpt" placeholder="A one or two line summary…">${esc(post ? post.excerpt : '')}</textarea></div>
      <div class="field"><label for="mUrl">Link (URL)</label><input id="mUrl" type="url" value="${esc(post ? post.url : '')}" placeholder="https://…"></div>
      <div class="field"><label>Thumbnail image</label>
        <div class="thumbs">${IMAGES.map(im => `<label><input type="radio" name="mImg" value="${im}" ${((post && post.img) || 'texture.webp') === im ? 'checked' : ''}><img src="${IMG_BASE}${im}" alt=""></label>`).join('')}</div>
      </div>
      <div class="field" style="display:flex;align-items:center;gap:.7rem;margin:0">
        <label class="switch"><input type="checkbox" id="mPub" ${!post || post.published ? 'checked' : ''}><span class="switch__track"></span></label>
        <span style="font-weight:500;color:var(--navy-700)">Published (visible on website)</span>
      </div>`;
    modal.classList.add('open');
  }
  function closeModal() { modal.classList.remove('open'); editingId = null; }
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalCancel').addEventListener('click', closeModal);
  $('#modalScrim').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

  $('#modalSave').addEventListener('click', () => {
    const title = $('#mTitle').value.trim();
    if (!title) { $('#mTitle').focus(); toast('Please add a title'); return; }
    const data = {
      title,
      category: $('#mCat').value.trim() || 'Insight',
      date: $('#mDate').value || today(),
      excerpt: $('#mExcerpt').value.trim(),
      url: $('#mUrl').value.trim(),
      img: (document.querySelector('input[name="mImg"]:checked') || {}).value || 'texture.webp',
      published: $('#mPub').checked
    };
    const posts = LS.get('nc_insights', []);
    if (editingId) {
      const it = posts.find(p => p.id === editingId); if (it) Object.assign(it, data);
      toast('Insight saved');
    } else {
      posts.unshift(Object.assign({ id: uid('i') }, data));
      toast('Insight added');
    }
    LS.set('nc_insights', posts);
    closeModal();
    route('insights');
  });

  /* ---------------- Mobile drawer ---------------- */
  const sidebar = $('#sidebar'), scrim = $('#sideScrim');
  function closeDrawer() { sidebar.classList.remove('open'); scrim.classList.remove('open'); }
  $('#hamburger').addEventListener('click', () => { sidebar.classList.toggle('open'); scrim.classList.toggle('open'); });
  scrim.addEventListener('click', closeDrawer);

  /* ---------------- Boot ---------------- */
  seed();
  if (authed()) showApp(); else showLogin();
})();
