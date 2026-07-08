/* =========================================================
   Nasheed & Co — Member profile page (member.html?id=<id>)
   Renders a single team member from the admin-managed data
   (localStorage "nc_team") or the shipped seed (team-data.js).
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = { get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } } };
  const initials = (name) => (String(name || '').trim().split(/\s+/).map(w => w[0] || '').slice(0, 2).join('') || '—').toUpperCase();

  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const ICON = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45z"/></svg>'
  };

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const card = $('#profileCard');
  if (!card) return;

  const id = new URLSearchParams(location.search).get('id');
  const team = LS.get('nc_team', null) || window.NC_TEAM_SEED || [];
  const m = team.find(x => x && x.id === id);

  if (!m) {
    document.title = 'Profile not found — Nasheed & Co';
    card.innerHTML = `<div class="profile__notfound">
      <h1>Profile not found</h1>
      <p>This team member may have been moved or removed.</p>
      <a class="btn btn--gold" href="index.html#team">Back to our team ${arrow}</a>
    </div>`;
    return;
  }

  document.title = `${m.name}${m.role ? ' — ' + m.role : ''} · Nasheed & Co`;

  const about = String(m.about || m.bio || '').split(/\n+/).map(p => p.trim()).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('') || `<p>${esc(m.bio || '')}</p>`;
  const tags = (m.tags || []).map(t => `<span>${esc(t)}</span>`).join('');
  const list = (arr) => (arr || []).filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('');
  const expertise = list(m.expertise), education = list(m.education);
  const langs = (m.languages || []).filter(Boolean).map(esc).join(', ');
  const metaRow = [
    m.location ? `<span>${ICON.pin}${esc(m.location)}</span>` : '',
    m.since ? `<span>${ICON.clock}At the firm since ${esc(m.since)}</span>` : '',
    langs ? `<span>${ICON.globe}${langs}</span>` : ''
  ].filter(Boolean).join('');
  const contacts = [
    m.email ? `<a class="pchip" href="mailto:${esc(m.email)}">${ICON.mail}${esc(m.email)}</a>` : '',
    m.phone ? `<a class="pchip" href="tel:${esc(String(m.phone).replace(/\s+/g, ''))}">${ICON.phone}${esc(m.phone)}</a>` : '',
    m.linkedin ? `<a class="pchip" href="${esc(m.linkedin)}" target="_blank" rel="noopener">${ICON.linkedin}LinkedIn</a>` : ''
  ].filter(Boolean).join('');
  const first = esc((m.name || '').split(/\s+/)[0] || 'us');

  card.innerHTML = `
    <span class="profile__badge">Nasheed &amp; Co · Our team</span>
    <div class="profile__head">
      <div class="profile__av">${esc(initials(m.name))}</div>
      <div class="profile__id">
        <p class="profile__role">${esc(m.role || '')}</p>
        <h1 class="profile__name">${esc(m.name)}</h1>
        ${metaRow ? `<div class="profile__meta">${metaRow}</div>` : ''}
      </div>
    </div>
    ${tags ? `<div class="profile__tags">${tags}</div>` : ''}
    <div class="profile__about">${about}</div>
    <div class="profile__cols">
      ${expertise ? `<div class="profile__block"><h4>Areas of focus</h4><ul>${expertise}</ul></div>` : ''}
      ${education ? `<div class="profile__block"><h4>Education &amp; admissions</h4><ul>${education}</ul></div>` : ''}
    </div>
    ${contacts ? `<div class="profile__contacts">${contacts}</div>` : ''}
    <div class="profile__cta">
      <a class="btn btn--gold" href="index.html#contact">Book a consultation ${arrow}</a>
      ${m.email ? `<a class="btn btn--ghost" href="mailto:${esc(m.email)}">Email ${first}</a>` : ''}
    </div>`;
})();
