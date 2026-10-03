/* Optional analytics are limited to the production domain and explicit choice.
   Local/staging previews never transmit visits. No typed enquiry content is sent. */
(() => {
 'use strict';
 const production=['prateeksaxena.me','www.prateeksaxena.me'].includes(location.hostname);
 const key='ps-analytics-choice-v2';
 let choice=null,started=false,opener=null;
 try {
   choice=localStorage.getItem(key);
   // Preserve refusals. An earlier opt-in did not name all three providers,
   // so ask again before loading the expanded, unified analytics choice.
   if(!choice && localStorage.getItem('ps-analytics-choice-v1')==='declined'){
     choice='declined';localStorage.setItem(key,choice);
   }
 } catch {}
 if(!['accepted','declined'].includes(choice)) choice=null;
 const panel=document.getElementById('analytics-choice');
 const current=panel?.querySelector('[data-consent-current]');
 const close=panel?.querySelector('[data-consent-close]');
 const status=document.getElementById('analytics-status');
 function describeChoice(){
   if(current) current.textContent=choice==='accepted' ? 'Current choice: optional analytics allowed.' : choice==='declined' ? 'Current choice: analytics rejected.' : 'Analytics stay off unless you allow them. You can use the full site either way.';
 }
 const readChoice=()=>choice==='accepted';
 window.siteAnalytics={allowed:()=>production && readChoice()};
 function start(){
   if(!production || !readChoice() || started) return;
   started=true;
   window['ga-disable-G-LFFECRD57Q']=false;
   window.dataLayer=window.dataLayer||[];
   window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
   window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   window.gtag('js',new Date());
   window.gtag('config','G-LFFECRD57Q',{allow_google_signals:false,allow_ad_personalization_signals:false});
   const ga=document.createElement('script');ga.async=true;ga.src='https://www.googletagmanager.com/gtag/js?id=G-LFFECRD57Q';document.head.append(ga);
   window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments);};
   // Explicitly communicate consent to Clarity before its first page capture.
   window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'granted'});
   const clarity=document.createElement('script');clarity.async=true;clarity.src='https://www.clarity.ms/tag/xf7w1d6iro';document.head.append(clarity);
   // Public beacon identifier supplied by this site's Cloudflare JS snippet.
   // Cloudflare automatic injection must stay off to preserve this consent gate.
   const performance=document.createElement('script');performance.type='module';performance.src='https://static.cloudflareinsights.com/beacon.min.js';
   performance.setAttribute('data-cf-beacon',JSON.stringify({token:'0bb6c8de182546c5b5b5cc70a694b49f'}));document.head.append(performance);
 }
 function forgetCookies(){
   ['_ga','_ga_LFFECRD57Q','_clck','_clsk'].forEach(name=>{
     ['',location.hostname,'.prateeksaxena.me'].forEach(domain=>{
       document.cookie=name+'=; Max-Age=0; path=/; SameSite=Lax'+(domain?'; domain='+domain:'');
     });
   });
 }
 function choose(value){
   choice=value;
   try{localStorage.setItem(key,value);}catch{}
   if(panel) panel.hidden=true;
   describeChoice();
   if(status) status.textContent=value==='accepted' ? 'Preference saved: optional analytics allowed.' : 'Preference saved: analytics rejected.';
   (opener?.isConnected ? opener : document.getElementById('main'))?.focus({preventScroll:true});
   opener=null;
   if(value==='accepted') start();
   else {
     window['ga-disable-G-LFFECRD57Q']=true;
     if(typeof window.clarity==='function') window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});
     forgetCookies();
     if(started) location.reload();
   }
 }
 panel?.querySelectorAll('[data-consent]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.consent==='accept'?'accepted':'declined')));
 function dismiss(){
   if(!opener || !panel) return;
   panel.hidden=true;
   if(status) status.textContent='Analytics settings closed. Your preference has not changed.';
   (opener.isConnected ? opener : document.getElementById('main'))?.focus({preventScroll:true});
   opener=null;
 }
 close?.addEventListener('click',dismiss);
 panel?.addEventListener('keydown',event=>{
   if(event.key==='Escape' && opener){event.preventDefault();dismiss();}
 });
 document.querySelectorAll('[data-privacy-settings]').forEach(button=>button.addEventListener('click',()=>{
   if(!panel) return;
   opener=button;describeChoice();if(close)close.hidden=false;panel.hidden=false;panel.querySelector('[data-consent="decline"]')?.focus();
 }));
 if(panel && production && !choice && !navigator.globalPrivacyControl) panel.hidden=false;
 if(navigator.globalPrivacyControl) choice='declined';
 describeChoice();
 if(readChoice()) start();
})();
