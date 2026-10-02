import assert from 'node:assert/strict';
import {readFileSync,statSync,existsSync} from 'node:fs';
import {allowAutoplay} from '../perspective/v1/loading-policy.mjs';
import {FACES,chapterAt,DURATION,END_FRAME} from '../perspective/v1/cube-timeline.mjs';
const desktop={contentReady:true,inView:true,hidden:false,width:1440,finePointer:true,reduced:false,saveData:false,effectiveType:'4g'};
assert.equal(allowAutoplay(desktop),true);
for(const device of [desktop,{...desktop,width:390,finePointer:false},{...desktop,width:768,finePointer:false}]){
 assert.equal(allowAutoplay(device),true,'Ready desktop, phone and tablet can autoplay');
 for(const override of [{contentReady:false},{inView:false},{hidden:true},{reduced:true},{saveData:true},{effectiveType:'3g'},{effectiveType:'2g'},{effectiveType:'slow-2g'}])assert.equal(allowAutoplay({...device,...override}),false,JSON.stringify(override));
 assert.equal(allowAutoplay({...device,effectiveType:undefined}),true,'Unknown connection is allowed, including Safari');
}
const html=readFileSync('index.html','utf8');
assert.match(html,/<style id="home-design">/);
assert.ok(!/<link[^>]*rel="stylesheet"/.test(html),'Homepage has no render-blocking stylesheet requests');
assert.ok(Buffer.byteLength(html)<75000,'Keep the complete homepage under 75 KB before compression');
for(const source of ['home.css','nav.css','consent.css','perspective/v1/site.css']){
 const compact=readFileSync(source,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean).join(' ').replace(/\s*([{};])\s*/g,'$1');
 assert.ok(html.includes(compact),'Built styles match '+source);
}
const video=html.match(/<video\b[^>]*id="hero-film"[^>]*>/)[0];
assert.ok(!/\bsrc=|\bautoplay\b|\bloop\b/.test(video),'No eager video URL, autoplay attribute or looping');
assert.match(video,/preload="none"/);
assert.match(html,/<img[^>]*id="cube-poster"[^>]*fetchpriority="high"[^>]*width="768"[^>]*height="768"/);
assert.match(html,/<h1 id="hero-title">Different sides\./);
assert.match(html,/<link href="https:\/\/prateeksaxena.me\/" rel="canonical"/);
assert.match(html,/name="robots"/);
assert.ok(!/<meta[^>]*noindex/.test(html),'Production HTML remains indexable');
assert.match(html,/"@type": "ProfilePage"/);
assert.match(html,/"@type": "Person"/);
assert.equal(chapterAt(0).id,'solve');assert.equal(chapterAt(7).id,'solved');
assert.equal(chapterAt(26).id,'complete');assert.equal(chapterAt(DURATION).id,'complete');
assert.ok(END_FRAME<DURATION&&DURATION-END_FRAME<.04);
for(const [index,face] of FACES.entries()){
 assert.equal(chapterAt(face.seek).id,face.id);
 assert.equal(chapterAt(face.start).index,index);
 assert.match(html,new RegExp('<dt>'+face.name+'</dt>'),'Meaning available without animation or JavaScript');
 assert.ok(html.includes(face.line));
 assert.ok(existsSync(`.pages-output/perspective/v1/${face.id}.webp`));
}
for(const file of ['hero.mjs','loading-policy.mjs','cube-timeline.mjs','site.css','opening.webp','ending.webp','cube-480.mp4','cube-768.mp4'])assert.ok(existsSync(`.pages-output/perspective/v1/${file}`),`Published: ${file}`);
assert.ok(statSync('perspective/v1/opening.webp').size<70000);
assert.ok(statSync('perspective/v1/cube-480.mp4').size<1700000);
assert.ok(statSync('perspective/v1/cube-768.mp4').size<4200000);
for(const file of ['fraunces-display.woff2','fraunces-display-italic.woff2'])assert.ok(existsSync(`.pages-output/perspective/v1/${file}`));
assert.ok(statSync('perspective/v1/fraunces-display.woff2').size+statSync('perspective/v1/fraunces-display-italic.woff2').size<160000,'Display fonts stay within their transfer budget');
assert.ok(!existsSync('.pages-output/build.mjs'));
console.log('Cube loading policy, timeline, crawlable content, asset budgets and deployment checks passed.');
