import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../analytics.js',import.meta.url),'utf8');
let total=0;
function run(host,initial=null,gpc=false,legacy=null){
 const clicks={}, settings={}, scripts=[], cookies=[], store=new Map(), consentCalls=[];
 if(initial)store.set('ps-analytics-choice-v2',initial);
 if(legacy)store.set('ps-analytics-choice-v1',legacy);
 let focused=null;
 const buttons=['accept','decline'].map(v=>({dataset:{consent:v},addEventListener:(k,fn)=>clicks[v]=fn,focus(){focused=this;}}));
 const current={textContent:''},status={textContent:''};
 const trigger={isConnected:true,addEventListener:(k,fn)=>settings.click=fn,focus(){focused=this;}};
 const main={focus(){focused=this;}};
 const close={hidden:true,addEventListener:(k,fn)=>clicks.close=fn};
 const panel={hidden:true,addEventListener:(k,fn)=>settings[k]=fn,querySelectorAll:()=>buttons,querySelector:s=>s==='[data-consent-current]'?current:s==='[data-consent-close]'?close:buttons.find(b=>b.dataset.consent==='decline')};
 const document={getElementById:id=>({'analytics-choice':panel,'analytics-status':status,main}[id]||null),querySelectorAll:()=>[trigger],createElement:()=>({setAttribute(k,v){this[k]=v;}}),head:{append:x=>scripts.push(x)}};
 Object.defineProperty(document,'cookie',{set:x=>cookies.push(x)});
 const location={hostname:host,reloads:0,reload(){this.reloads++;}};
 const context={document,location,navigator:{globalPrivacyControl:gpc},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},window:{},Date};
 vm.runInNewContext(source,context);
 return {context,clicks,scripts,cookies,store,panel,settings,current,status,trigger,main,close,focused:()=>focused};
}
function test(name,fn){fn();total++;console.log('PASS '+name);}
test('No optional requests before production consent',()=>{const x=run('prateeksaxena.me');assert.equal(x.scripts.length,0);assert.equal(x.panel.hidden,false);assert.equal(x.context.window.siteAnalytics.allowed(),false)});
test('Reject keeps all providers off and remembers the choice',()=>{const x=run('prateeksaxena.me');x.clicks.decline();assert.equal(x.scripts.length,0);assert.equal(x.context.window.siteAnalytics.allowed(),false);assert.equal(x.store.get('ps-analytics-choice-v2'),'declined');assert.equal(x.panel.hidden,true);assert.match(x.status.textContent,/analytics rejected/)});
test('Cloudflare is included only after consent and starts once',()=>{const x=run('prateeksaxena.me');assert.equal(x.scripts.length,0);x.clicks.accept();x.clicks.accept();const cf=x.scripts.filter(s=>s.src?.includes('cloudflareinsights.com'));assert.equal(cf.length,1);assert.equal(cf[0].type,'module');assert.ok(JSON.parse(cf[0]['data-cf-beacon']).token)});
test('Existing refusals survive the expanded provider disclosure',()=>{const x=run('prateeksaxena.me',null,false,'declined');assert.equal(x.panel.hidden,true);assert.equal(x.scripts.length,0);assert.equal(x.store.get('ps-analytics-choice-v2'),'declined')});
test('Existing opt-in is requested again for the newly disclosed provider',()=>{const x=run('prateeksaxena.me',null,false,'accepted');assert.equal(x.panel.hidden,false);assert.equal(x.scripts.length,0);assert.equal(x.context.window.siteAnalytics.allowed(),false)});
test('Local preview cannot transmit even after accepting',()=>{const x=run('127.0.0.1');x.clicks.accept();assert.equal(x.scripts.length,0);assert.equal(x.context.window.siteAnalytics.allowed(),false)});
test('Unrecognized staging host never transmits',()=>{const x=run('preview.example.com','accepted');assert.equal(x.scripts.length,0)});
test('Remembered refusal does not prompt again',()=>{const x=run('prateeksaxena.me','declined');assert.equal(x.scripts.length,0);assert.equal(x.panel.hidden,true)});
test('Accept starts each provider once',()=>{const x=run('prateeksaxena.me');x.clicks.accept();x.clicks.accept();assert.equal(x.scripts.length,3);assert.equal(x.context.window.siteAnalytics.allowed(),true);assert.equal(x.store.get('ps-analytics-choice-v2'),'accepted')});
test('Accept after initial decline re-enables GA correctly',()=>{const x=run('prateeksaxena.me');x.clicks.decline();x.clicks.accept();assert.equal(x.context.window['ga-disable-G-LFFECRD57Q'],false);assert.equal(x.scripts.length,3)});
test('Advertising signals are denied on analytics opt-in',()=>{const x=run('prateeksaxena.me','accepted');const events=x.context.window.dataLayer.map(x=>Array.from(x));assert.equal(events[0][2].ad_storage,'denied');assert.equal(events[2][2].allow_google_signals,false);assert.equal(x.context.window.clarity.q[0][1].ad_Storage,'denied')});
test('Withdrawal disables tracking, clears provider cookies and reloads',()=>{const x=run('prateeksaxena.me','accepted');x.clicks.decline();assert.equal(x.context.window.siteAnalytics.allowed(),false);assert.equal(x.context.window['ga-disable-G-LFFECRD57Q'],true);assert.equal(x.context.location.reloads,1);assert.equal(x.cookies.length,12)});
test('Preferences can be reopened',()=>{const x=run('prateeksaxena.me','declined');x.settings.click();assert.equal(x.panel.hidden,false)});
test('Dismiss reopened opt-in without changing consent or reloading',()=>{const x=run('prateeksaxena.me','accepted');x.settings.click();assert.equal(x.close.hidden,false);x.clicks.close();assert.equal(x.panel.hidden,true);assert.equal(x.store.get('ps-analytics-choice-v2'),'accepted');assert.equal(x.scripts.length,3);assert.equal(x.context.location.reloads,0);assert.equal(x.cookies.length,0);assert.equal(x.focused(),x.trigger)});
test('Escape closes reopened refusal without starting analytics',()=>{const x=run('prateeksaxena.me','declined');x.settings.click();let prevented=false;x.settings.keydown({key:'Escape',preventDefault(){prevented=true}});assert.equal(prevented,true);assert.equal(x.panel.hidden,true);assert.equal(x.store.get('ps-analytics-choice-v2'),'declined');assert.equal(x.scripts.length,0);assert.equal(x.focused(),x.trigger)});
test('Initial banner does not silently dismiss or assume consent',()=>{const x=run('prateeksaxena.me');assert.equal(x.close.hidden,true);x.settings.keydown({key:'Escape'});x.clicks.close();assert.equal(x.panel.hidden,false);assert.equal(x.scripts.length,0);assert.equal(x.store.has('ps-analytics-choice-v2'),false)});
test('Remembered preview consent cannot start trackers',()=>{const x=run('dev.prateeksaxena.pages.dev','accepted');assert.equal(x.scripts.length,0);x.settings.click();x.clicks.accept();assert.equal(x.scripts.length,0)});
test('Closing preferences restores focus to the originating control',()=>{const x=run('dev.prateeksaxena.pages.dev','declined');x.settings.click();x.clicks.decline();assert.equal(x.focused(),x.trigger);assert.match(x.status.textContent,/analytics rejected/);assert.equal(x.panel.hidden,true)});
test('Accepting from a reopened panel returns focus and updates current choice',()=>{const x=run('dev.prateeksaxena.pages.dev','declined');x.settings.click();x.clicks.accept();assert.equal(x.focused(),x.trigger);x.settings.click();assert.match(x.current.textContent,/allowed/)});
test('Initial choice moves focus to content rather than a hidden button',()=>{const x=run('prateeksaxena.me');x.clicks.decline();assert.equal(x.focused(),x.main)});
test('Global privacy signal prevents remembered opt-in loading trackers',()=>{const x=run('prateeksaxena.me','accepted',true);assert.equal(x.scripts.length,0);assert.equal(x.context.window.siteAnalytics.allowed(),false);assert.match(x.current.textContent,/analytics rejected/)});

const ux=fs.readFileSync(new URL('../ux.js',import.meta.url),'utf8');
function tracker(href,allowed=true){
 const events=[],listeners={};
 const document={getElementById:()=>null,querySelectorAll:()=>[],addEventListener:(name,fn)=>listeners[name]=fn};
 const location={href:'https://prateeksaxena.me/',pathname:'/'};
 const window={siteAnalytics:{allowed:()=>allowed},gtag:(...a)=>events.push(a)};
 vm.runInNewContext(ux,{document,location,window,URL});
 const link={href:new URL(href,location.href).href,getAttribute:()=>href,dataset:{engagement:'advisory'},closest:()=>null};
 listeners.click({target:{closest:()=>link}});
 return events;
}
test('Email event counts intent without sending email or enquiry text',()=>{const e=tracker('mailto:prateeksax@gmail.com?subject=Private%20request');assert.equal(e.length,1);assert.equal(e[0][1],'email_click');assert.equal(e[0][2].engagement_type,'advisory');assert.ok(!JSON.stringify(e).includes('@'));assert.ok(!JSON.stringify(e).includes('Private'))});
test('No consent means no custom event',()=>assert.equal(tracker('mailto:a@example.com',false).length,0));
test('Anchor contact CTA retains existing event name',()=>assert.equal(tracker('/#engage')[0][1],'cta_engage_click'));
test('Internal article reading is not misclassified as an enquiry',()=>assert.equal(tracker('/journal/vibe-coding-in-a-suit').length,0));
console.log(JSON.stringify({passed:total}));
