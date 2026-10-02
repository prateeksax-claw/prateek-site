/* Shared interactions. Native scrolling; no perpetual animation loop. */
(() => {
  'use strict';
  const trigger = document.getElementById('menuBtn');
  const menu = document.getElementById('mmenu');
  let restoreInert = [];
  let open = false;
  const focusable = () => [...menu.querySelectorAll('a[href],button:not([disabled])')].filter(el => el.getClientRects().length);
  const closeMenu = (restoreFocus = true) => {
    if (!menu || !open) return;
    open = false;
    menu.classList.remove('open');
    if(menu.open) menu.close();
    menu.setAttribute('aria-hidden','true');
    menu.inert = true;
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('aria-label','Open menu');
    document.documentElement.classList.remove('menulock');
    restoreInert.forEach(([el, original]) => { el.inert = original; });
    restoreInert = [];
    if (restoreFocus) trigger.focus({preventScroll:true});
  };
  if (trigger && menu) {
    menu.inert = true;
    trigger.addEventListener('click', () => {
      if (open) return closeMenu();
      open = true;
      menu.inert = false;
      menu.classList.add('open');
      menu.setAttribute('aria-hidden','false');
      menu.showModal();
      trigger.classList.add('open');
      trigger.setAttribute('aria-expanded','true');
      trigger.setAttribute('aria-label','Close menu');
      document.documentElement.classList.add('menulock');
      // The modal is a direct body child on every page; preserve any existing inert state.
      [...document.body.children].filter(el => el !== menu && !['SCRIPT','STYLE','LINK'].includes(el.tagName)).forEach(el => {
        restoreInert.push([el,el.inert]); el.inert = true;
      });
      focusable()[0]?.focus({preventScroll:true});
    });
    menu.querySelector('[data-menu-close]').addEventListener('click', () => closeMenu());
    menu.addEventListener('click', e => {
      if (e.target === menu) return closeMenu();
      const link = e.target.closest('a[href]');
      if (!link) return;
      closeMenu(false);
      const destination = new URL(link.href, location.href);
      if (destination.origin === location.origin && destination.pathname === location.pathname && destination.hash) {
        const target = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
        if (target) { target.setAttribute('tabindex','-1'); target.focus({preventScroll:true}); }
      }
    });
    document.addEventListener('keydown', e => {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
      if (e.key !== 'Tab') return;
      const items=focusable(), first=items[0], last=items.at(-1);
      if (e.shiftKey && (document.activeElement === first || !menu.contains(document.activeElement))) {
        e.preventDefault(); last?.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !menu.contains(document.activeElement))) {
        e.preventDefault(); first?.focus();
      }
    });
    matchMedia('(min-width:1101px)').addEventListener('change', e => { if(e.matches) closeMenu(false); });
  }
  document.querySelectorAll('.nlinks a,.mlinks a').forEach(link => {
    if (new URL(link.href).pathname === location.pathname && !link.hash) link.setAttribute('aria-current','page');
  });
  // Keep existing event names for continuity; never send email addresses or enquiry text.
  document.addEventListener('click', e => {
    const link=e.target.closest('a[href]');
    if (!link || !window.siteAnalytics?.allowed()) return;
    const href=link.getAttribute('href');
    let event;
    if (href.startsWith('mailto:')) event='email_click';
    else if (new URL(link.href,location.href).hostname === 'www.linkedin.com') event='linkedin_click';
    else if (new URL(link.href,location.href).pathname === '/media-kit') event='media_kit_click';
    else if (new URL(link.href,location.href).hash === '#engage') event='cta_engage_click';
    if (event) window.gtag('event',event,{
      from:location.pathname,
      engagement_type:link.dataset.engagement || 'general',
      placement:link.closest('footer') ? 'footer' : link.closest('#nav,#mmenu') ? 'navigation' : 'content'
    });
  });
  document.querySelectorAll('[data-copy-bio]').forEach(button => button.addEventListener('click',async () => {
    const text=document.getElementById(button.dataset.copyBio)?.innerText;
    const status=button.parentElement.querySelector('[role="status"]');
    try { await navigator.clipboard.writeText(text.trim()); status.textContent='Bio copied.'; }
    catch { status.textContent='Copy is unavailable. Select the biography text to copy it.'; }
  }));
  document.querySelectorAll('[data-copy-email]').forEach(button => button.addEventListener('click',async () => {
    const email=document.getElementById(button.dataset.copyEmail)?.textContent.trim();
    const status=button.parentElement.querySelector('[role="status"]');
    try {
      if(!email) throw new Error('Missing contact address');
      await navigator.clipboard.writeText(email);
      status.textContent='Email address copied.';
      if(window.siteAnalytics?.allowed()) window.gtag('event','email_copy',{from:location.pathname,engagement_type:'general',placement:'contact'});
    } catch { status.textContent='Select the email address above to copy it.'; }
  }));
})();
