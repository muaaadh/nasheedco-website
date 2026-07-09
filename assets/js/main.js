/* =========================================================
   Nasheed & Co — interactions
   ========================================================= */
(function () {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---- Shared storage helpers (also used by the admin portal) ---- */
  const LS = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = (d) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || '');
    if (!m) return d || '';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1];
  };

  /* ---- Year ---- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Insights: hydrate from admin-managed content if present ---- */
  const insightsGrid = $('#insightsGrid');
  const storedPosts = LS.get('nc_insights', null);
  if (insightsGrid && Array.isArray(storedPosts)) {
    const pub = storedPosts.filter(p => p && p.published);
    if (pub.length) {
      const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      insightsGrid.innerHTML = pub.map((p, i) => {
        const href = /^https?:\/\//.test(p.url || '') ? esc(p.url) : '#insights';
        const img = esc(p.img || 'banner.webp');
        const cat = esc(p.category || 'Insight');
        return `<article class="post reveal"${i > 0 ? ` data-d="${Math.min(i, 2)}"` : ''} data-category="${cat}">
          <a class="post__thumb" href="${href}" target="_blank" rel="noopener">
            <span class="post__cat">${cat}</span>
            <img src="assets/img/${img}" alt="${esc(p.title)}" loading="lazy" />
          </a>
          <div class="post__body">
            <span class="post__date">${esc(fmtDate(p.date))}</span>
            <h3 class="post__title">${esc(p.title)}</h3>
            <p class="post__excerpt">${esc(p.excerpt || '')}</p>
            <a class="textlink" href="${href}" target="_blank" rel="noopener">Read more ${arrow}</a>
          </div>
        </article>`;
      }).join('');
    }
  }

  /* ---- Team: render cards linking to each member's profile page ---- */
  const teamGrid = $('#teamGrid');
  const teamData = (typeof window.NC_getTeam === 'function') ? window.NC_getTeam() : (LS.get('nc_team', null) || window.NC_TEAM_SEED || []);
  const teamInitials = (name) => (String(name || '').trim().split(/\s+/).map(w => w[0] || '').slice(0, 2).join('') || '—').toUpperCase();
  const arrowSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  if (teamGrid && Array.isArray(teamData)) {
    const vis = teamData.filter(m => m && m.published);
    if (vis.length) {
      teamGrid.innerHTML = vis.map((m, i) => {
        const idx = String(i + 1).padStart(2, '0');
        const face = m.photo
          ? `<img class="member__photo" src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy" />`
          : `<span class="member__mono">${esc(teamInitials(m.name))}</span>`;
        return `<a class="member reveal" href="member.html?id=${encodeURIComponent(m.id)}"${i > 0 ? ` data-d="${Math.min(i, 3)}"` : ''}>
          <div class="member__portrait${m.photo ? ' has-photo' : ''}">
            ${face}
            <span class="member__index">${idx}</span>
            <span class="member__cta">View profile ${arrowSvg}</span>
          </div>
          <div class="member__info">
            <h3 class="member__name">${esc(m.name)}</h3>
            <p class="member__role">${esc(m.role || '')}</p>
          </div>
        </a>`;
      }).join('');
    }
  }

  /* ---- Insights: topic filter ---- */
  const insightsFilters = $('#insightsFilters');
  if (insightsGrid && insightsFilters) {
    const posts = () => $$('.post', insightsGrid);
    const cats = [];
    posts().forEach(p => { const c = (p.dataset.category || '').trim(); if (c && !cats.includes(c)) cats.push(c); });
    if (cats.length >= 2) {
      insightsFilters.hidden = false;
      insightsFilters.innerHTML = ['All', ...cats]
        .map((c, i) => `<button type="button" class="chip${i === 0 ? ' is-active' : ''}" data-cat="${i === 0 ? '*' : esc(c)}">${esc(c)}</button>`)
        .join('');
      insightsFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        $$('.chip', insightsFilters).forEach(c => c.classList.toggle('is-active', c === btn));
        const want = btn.dataset.cat;
        posts().forEach(p => {
          p.classList.toggle('is-hidden', !(want === '*' || (p.dataset.category || '') === want));
        });
      });
    }
  }

  /* ---- Sticky header state ---- */
  const header = $('#siteHeader');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile nav ---- */
  const toggle = $('#navToggle');
  const links  = $('#navLinks');
  const scrim  = $('#navScrim');
  const setNav = (open) => {
    if (!toggle || !links) return;
    toggle.classList.toggle('open', open);
    links.classList.toggle('open', open);
    scrim && scrim.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle && toggle.addEventListener('click', () => setNav(!links.classList.contains('open')));
  scrim  && scrim.addEventListener('click', () => setNav(false));
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });
  if (/[?&]nav=1/.test(location.search)) setNav(true); // dev/screenshot hook

  /* ---- Scroll reveal ---- */
  const revealEls = $$('.reveal');
  const forceReveal = /[?&]reveal=1/.test(location.search);
  if (forceReveal) {
    revealEls.forEach(el => el.classList.add('in'));
  } else if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* =========================================================
     The Concierge — interactive matter navigator
     ========================================================= */
  const ICON = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
  };

  const SECTORS = {
    resort: {
      label: 'Resort & Hospitality',
      blurb: 'From island lease and development to day-to-day operations, your exposure runs across leasing, construction, staffing and guest liability.',
      help:  'Deep familiarity with Tourism Act leases, resort development and hospitality operations.',
      base:  ['Hotels, Resorts, Tourism', 'Foreign Investment', 'Employment & Labour'],
      insight: { t: 'Lease Extension: Development under the 15th Amendment to the Tourism Act', u: 'https://www.nasheeds.co/blog/lease-extension-development-under-the-15th-amendment-to-the-tourism-act' }
    },
    aviation: {
      label: 'Aviation & Airlines',
      blurb: 'Carriers, seaplane and ground operators meet specialist regulatory, licensing and liability questions at every turn.',
      help:  'Regulatory fluency across civil aviation, licensing and operating agreements.',
      base:  ['General Commercial', 'Contractual Disputes', 'Insurance'],
      insight: { t: 'Maldives to Enforce New Seaplane Platform Licensing Regulation', u: 'https://www.nasheeds.co/news/maldives-to-enforce-new-seaplane-platform-licensing-regulation' }
    },
    banking: {
      label: 'Bank / Financial Institution',
      blurb: 'Financing, security and regulatory compliance demand watertight documentation and current knowledge of MMA rules.',
      help:  'Current, practical knowledge of MMA regulation and financing documentation.',
      base:  ['Banking & Finance', 'General Commercial', 'Tax'],
      insight: { t: 'New Forex Bill in the Maldives: What Businesses Need to Know', u: 'https://www.nasheeds.co/blog/new-forex-bill-in-the-maldives-what-businesses-need-to-know' }
    },
    corporate: {
      label: 'Corporate / Enterprise',
      blurb: 'Telecoms, insurers and large corporates need one accountable team across contracts, governance and high-value disputes.',
      help:  'Commercial advice that moves deals forward — not just risk warnings.',
      base:  ['Corporate Law', 'General Commercial', 'Mergers & Acquisitions'],
      insight: { t: 'Get Ready: New Forex Act Takes Effect January 1st', u: 'https://www.nasheeds.co/news/get-ready-new-forex-act-take-effect-january-1st' }
    },
    individual: {
      label: 'Individual / Family',
      blurb: 'We act with the same care for individuals — from family matters to injury claims and property disputes.',
      help:  'Discreet, patient guidance through personal and family legal matters.',
      base:  ['Family Matters', 'Injury & Compensation', 'Property & Boundary'],
      insight: { t: 'Summary Translation: Maldives Foreign Currency Act', u: 'https://www.nasheeds.co/blog/summary-translation-maldives-foreign-currency-act' }
    }
  };

  const NEEDS = {
    venture:    { label: 'Starting or investing', frame: 'You’re establishing or investing in a Maldivian venture.', help: 'Set up the right structure and approvals before you commit capital.', add: ['Corporate Law', 'Foreign Investment'] },
    deal:       { label: 'A deal or contract',    frame: 'You have a transaction or agreement to get right.',          help: 'Negotiate, draft and complete contracts that protect your position.',      add: ['General Commercial', 'Mergers & Acquisitions'] },
    dispute:    { label: 'A dispute or claim',     frame: 'You’re facing — or want to avoid — a dispute.',              help: 'Resolve matters commercially: negotiation, the courts, or arbitration.',    add: ['Contractual Disputes', 'Debt Recovery & Collection'] },
    compliance: { label: 'Compliance & regulation',frame: 'You need to stay compliant and ahead of regulation.',         help: 'Stay ahead of GST/TGST, foreign-currency and sector rules before they bite.', add: ['Tax', 'General Commercial'] },
    retainer:   { label: 'Ongoing counsel',        frame: 'You want an always-on legal partner.',                       help: 'A named partner on call as an extension of your team — predictable and budgeted.', add: ['Corporate Law', 'Employment & Labour'] }
  };

  const state = { sector: 'resort', need: 'venture' };

  const resultEl   = $('#conciergeResult');
  const sectorBtns = $$('[data-sector]');
  const needBtns   = $$('[data-need]');

  const dedupe = (arr) => arr.filter((v, i) => arr.indexOf(v) === i);

  function render(animate) {
    if (!resultEl) return;
    const s = SECTORS[state.sector];
    const n = NEEDS[state.need];
    const areas = dedupe([...s.base, ...n.add]);
    const chips = areas.map(a =>
      `<a class="chip" href="#expertise">${a}</a>`).join('');
    const help = [s.help, n.help, 'One accountable team across corporate, regulatory, employment and disputes.']
      .map(h => `<li>${ICON.check}<span>${h}</span></li>`).join('');

    resultEl.innerHTML = `
      <span class="result__badge">Tailored for you</span>
      <h3 class="result__title">${s.label}</h3>
      <p class="result__note">${n.frame} ${s.blurb}</p>

      <p class="result__sub">Practice areas we’d bring in</p>
      <div class="result__chips">${chips}</div>

      <p class="result__sub">How we’d help</p>
      <ul class="result__list">${help}</ul>

      <div class="result__foot">
        <a class="btn btn--gold btn--sm" href="#contact">Start a confidential conversation
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <span class="result__insight">Relevant reading: <a href="${s.insight.u}" target="_blank" rel="noopener">${s.insight.t}</a></span>
      </div>`;

    if (animate) {
      resultEl.classList.remove('swap');
      void resultEl.offsetWidth; // reflow to restart animation
      resultEl.classList.add('swap');
    }
  }

  function bind(btns, key) {
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        state[key] = btn.dataset[key];
        btns.forEach(b => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        render(true);
      });
    });
  }

  if (resultEl) {
    bind(sectorBtns, 'sector');
    bind(needBtns, 'need');
    render(false);
  }

  /* =========================================================
     Contact form (mock submit)
     ========================================================= */
  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      // Persist the enquiry so the admin portal can read it (demo — same device only)
      const enquiry = {
        id: 'e' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
        name: form.name.value.trim(),
        organisation: form.organisation.value.trim(),
        email: form.email.value.trim(),
        matter: form.matter.value,
        message: form.message.value.trim(),
        date: new Date().toISOString(),
        read: false
      };
      const list = LS.get('nc_enquiries', []);
      list.unshift(enquiry);
      LS.set('nc_enquiries', list);

      const ok = $('#formSuccess');
      if (ok) {
        ok.classList.add('show');
        ok.querySelector('span').textContent =
          'Thank you, ' + (enquiry.name || 'there') + ' — your enquiry has been recorded. A member of our team will be in touch shortly.';
      }
      form.querySelector('button[type="submit"]').textContent = 'Enquiry received';
      form.reset();
      ok && ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
})();
