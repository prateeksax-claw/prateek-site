/* Optional analytics are limited to the production domain and explicit choice.
   Local/staging previews never transmit visits. No typed enquiry content is sent. */
(() => {
 'use strict';
 const production=['prateeksaxena.me','www.prateeksaxena.me'].includes(location.hostname);
 const key='ps-analytics-choice-v1';
 let choice=null,started=false;
 try { choice=localStorage.getItem(key); } catch {}
 const panel=document.getElementById('analytics-choice');
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
   panel.hidden=true;
   if(value==='accepted') start();
   else {
     window['ga-disable-G-LFFECRD57Q']=true;
     if(typeof window.clarity==='function') window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});
     forgetCookies();
     if(started) location.reload();
   }
 }
 panel?.querySelectorAll('[data-consent]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.consent==='accept'?'accepted':'declined')));
 document.querySelectorAll('[data-privacy-settings]').forEach(button=>button.addEventListener('click',()=>{panel.hidden=false;panel.querySelector('button').focus();}));
 if(production && !choice && !navigator.globalPrivacyControl) panel.hidden=false;
 if(navigator.globalPrivacyControl) choice='declined';
 if(readChoice()) start();
})();
