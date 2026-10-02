import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../analytics.js',import.meta.url),'utf8');
let total=0;
function run(host,initial=null){
 const clicks={}, settings={}, scripts=[], cookies=[], store=new Map(), consentCalls=[];
 if(initial)store.set('ps-analytics-choice-v1',initial);
 const buttons=['accept','decline'].map(v=>({dataset:{consent:v},addEventListener:(k,fn)=>clicks[v]=fn,focus(){}}));
 const panel={hidden:true,querySelectorAll:()=>buttons,querySelector:()=>buttons[0]};
 const document={getElementById:()=>panel,querySelectorAll:()=>[{addEventListener:(k,fn)=>settings.click=fn}],createElement:()=>({}),head:{append:x=>scripts.push(x)}};
 Object.defineProperty(document,'cookie',{set:x=>cookies.push(x)});
 const location={hostname:host,reloads:0,reload(){this.reloads++;}};
 const context={document,location,navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},window:{},Date};
 vm.runInNewContext(source,context);
 return {context,clicks,scripts,cookies,store,panel,settings};
}
function test(name,fn){fn();total++;console.log('PASS '+name);}
test('No optional requests before production consent',()=>{const x=run('prateeksaxena.me');assert.equal(x.scripts.length,0);assert.equal(x.panel.hidden,false);assert.equal(x.context.window.siteAnalytics.allowed(),false)});
test('Local preview cannot transmit even after accepting',()=>{const x=run('127.0.0.1');x.clicks.accept();assert.equal(x.scripts.length,0);assert.equal(x.context.window.siteAnalytics.allowed(),false)});
test('Unrecognized staging host never transmits',()=>{const x=run('preview.example.com','accepted');assert.equal(x.scripts.length,0)});
test('Remembered refusal does not prompt again',()=>{const x=run('prateeksaxena.me','declined');assert.equal(x.scripts.length,0);assert.equal(x.panel.hidden,true)});
test('Accept starts each provider once',()=>{const x=run('prateeksaxena.me');x.clicks.accept();x.clicks.accept();assert.equal(x.scripts.length,2);assert.equal(x.context.window.siteAnalytics.allowed(),true);assert.equal(x.store.get('ps-analytics-choice-v1'),'accepted')});
test('Accept after initial decline re-enables GA correctly',()=>{const x=run('prateeksaxena.me');x.clicks.decline();x.clicks.accept();assert.equal(x.context.window['ga-disable-G-LFFECRD57Q'],false);assert.equal(x.scripts.length,2)});
test('Advertising signals are denied on analytics opt-in',()=>{const x=run('prateeksaxena.me','accepted');const events=x.context.window.dataLayer.map(x=>Array.from(x));assert.equal(events[0][2].ad_storage,'denied');assert.equal(events[2][2].allow_google_signals,false);assert.equal(x.context.window.clarity.q[0][1].ad_Storage,'denied')});
test('Withdrawal disables tracking, clears provider cookies and reloads',()=>{const x=run('prateeksaxena.me','accepted');x.clicks.decline();assert.equal(x.context.window.siteAnalytics.allowed(),false);assert.equal(x.context.window['ga-disable-G-LFFECRD57Q'],true);assert.equal(x.context.location.reloads,1);assert.equal(x.cookies.length,12)});
test('Preferences can be reopened',()=>{const x=run('prateeksaxena.me','declined');x.settings.click();assert.equal(x.panel.hidden,false)});

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
