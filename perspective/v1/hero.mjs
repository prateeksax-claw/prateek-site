import {DURATION,END_FRAME,FACES,chapterAt,labelFor,timeLabel,clampTime} from './cube-timeline.mjs';
import {allowAutoplay} from './loading-policy.mjs?v=20261002-mobile';
const video=document.querySelector('#hero-film'),stage=document.querySelector('#object-window'),poster=document.querySelector('#cube-poster'),
 play=document.querySelector('#play-solve'),label=document.querySelector('#play-label'),replay=document.querySelector('#replay-cube'),skip=document.querySelector('#skip-cube'),
 seek=document.querySelector('#cube-seek'),time=document.querySelector('#cube-time'),error=document.querySelector('#film-error'),buffer=document.querySelector('#buffering'),
 status=document.querySelector('#motion-status'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),faceButtons=[...document.querySelectorAll('.cube-faces [data-face]')];
let mode='idle',position=0,chapter='',loadPromise=null,action=0,autoAttempted=false,inView=false,frameCallback=null,contentReady=false;
const assets=new URL('./',import.meta.url);
const asset=name=>new URL(name,assets).href;
const staticMode=()=>reduced.matches||Boolean(navigator.connection?.saveData);
function setMode(next){mode=next;document.querySelector('.object').dataset.state=mode;label.textContent=labelFor(mode);play.querySelector('.play-icon').textContent=mode==='playing'?'Ⅱ':'▶';play.setAttribute('aria-label',labelFor(mode));replay.hidden=mode==='idle'||mode==='error'||mode==='ended';skip.hidden=mode==='ended'||mode==='error';buffer.hidden=mode!=='loading';}
function sync(t){
 position=clampTime(t);stage.dataset.time=position.toFixed(3);seek.value=String(position);time.value=`${timeLabel(position)} / 0:30`;
 const c=chapterAt(position);seek.setAttribute('aria-valuetext',`${timeLabel(position)} of 0:30. ${c.title}`);
 if(c.id===chapter)return;chapter=c.id;stage.dataset.chapter=c.id;
 document.querySelector('#cube-kicker').textContent=c.kicker;document.querySelector('#cube-title').textContent=c.title;document.querySelector('#cube-meaning').textContent=c.line;
 faceButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===c.index)));
 // Announce changes made by the visitor, not every automatic face transition.
}
function announce(){const c=chapterAt(position);status.textContent=`${c.title} ${c.line}`;}
function stopFrames(){if(frameCallback!==null&&video.cancelVideoFrameCallback){video.cancelVideoFrameCallback(frameCallback);frameCallback=null;}}
function followFrames(){if(!video.requestVideoFrameCallback)return;stopFrames();const token=action;const tick=(_,data)=>{frameCallback=null;if(token!==action||mode!=='playing'||video.paused)return;sync(data.mediaTime);if(!video.ended)frameCallback=video.requestVideoFrameCallback(tick);};frameCallback=video.requestVideoFrameCallback(tick);}
function pause(){action++;video.pause();stopFrames();if(mode==='playing'){sync(video.currentTime);setMode('paused');}else if(mode==='loading'){setMode('paused');}buffer.hidden=true;}
function fallback(){video.pause();stopFrames();loadPromise=null;setMode('error');error.hidden=false;stage.dataset.visual='poster';const c=chapterAt(position);poster.src=asset(c.index>=0?`${FACES[c.index].id}.webp`:'ending.webp');poster.alt=c.index>=0?`${FACES[c.index].name}. ${FACES[c.index].line}`:'The complete perspective cube, with all six artworks aligned.';if(c.index<0)sync(END_FRAME);}
function load(){
 if(video.readyState>=1)return Promise.resolve();if(loadPromise)return loadPromise;
 loadPromise=new Promise((resolve,reject)=>{
   const clear=()=>{clearTimeout(timer);video.removeEventListener('loadedmetadata',ok);video.removeEventListener('error',bad);};
   const ok=()=>{clear();resolve();};const bad=()=>{clear();loadPromise=null;reject(new Error('Media unavailable'));};const timer=setTimeout(bad,12000);
   video.addEventListener('loadedmetadata',ok,{once:true});video.addEventListener('error',bad,{once:true});
   video.muted=true;video.defaultMuted=true;video.playsInline=true;
   video.src=asset(innerWidth<=600?'cube-480.mp4':'cube-768.mp4');video.load();
 });return loadPromise;
}
async function moveTo(t,run=false,{restart=false}={}){
 const token=++action;autoAttempted=true;video.pause();stopFrames();error.hidden=true;const target=restart?0:Math.min(clampTime(t),END_FRAME);
 sync(target);setMode('loading');
 if(restart){poster.src=asset('opening.webp');poster.alt='The perspective cube, with six abstract artworks waiting to align.';stage.dataset.visual='poster';}
 try{
   await load();if(token!==action)return;
   if(Math.abs(video.currentTime-target)>.008){
     await new Promise((resolve,reject)=>{
       const clear=()=>{clearTimeout(timer);video.removeEventListener('seeked',ok);video.removeEventListener('error',bad);};
       const ok=()=>{clear();resolve();};const bad=()=>{clear();reject(new Error('Seek unavailable'));};const timer=setTimeout(bad,10000);
       video.addEventListener('seeked',ok,{once:true});video.addEventListener('error',bad,{once:true});video.currentTime=target;
     });
   }
   if(token!==action)return;
   if(run){await video.play();if(token!==action){if(mode!=='playing')video.pause();return;}setMode('playing');stage.dataset.visual='film';followFrames();}
   else{stage.dataset.visual='film';sync(target>=END_FRAME?DURATION:target);setMode(target>=END_FRAME?'ended':'paused');announce();}
 }catch(e){if(token!==action)return;if(e?.name==='NotAllowedError'){setMode(position===0?'idle':'paused');status.textContent=`Select ${labelFor(mode)} to play.`;}else fallback();}
}
function inspect(index){
 const f=FACES[index];if(!f)return;action++;autoAttempted=true;video.pause();stopFrames();poster.src=asset(`${f.id}.webp`);poster.alt=`${f.name}: ${f.symbol}. ${f.line}`;stage.dataset.visual='poster';sync(f.seek);setMode('face');error.hidden=true;announce();
}
play.addEventListener('click',()=>{if(mode==='playing'||mode==='loading'){pause();return;}const restart=mode==='ended'||mode==='error';if(mode==='error'){loadPromise=null;video.removeAttribute('src');video.load();}moveTo(restart?0:position,true,{restart});});
replay.addEventListener('click',()=>moveTo(0,true,{restart:true}));
skip.addEventListener('click',()=>moveTo(END_FRAME,false));
document.querySelector('#retry-cube').addEventListener('click',()=>{loadPromise=null;video.removeAttribute('src');video.load();moveTo(0,true,{restart:true});});
faceButtons.forEach(b=>b.addEventListener('click',()=>inspect(Number(b.dataset.face))));
seek.addEventListener('input',()=>{const target=Number(seek.value);pause();sync(target);});
seek.addEventListener('change',()=>moveTo(Number(seek.value),false));
video.addEventListener('timeupdate',()=>{if(mode==='playing')sync(video.currentTime);});
video.addEventListener('ended',()=>{stopFrames();sync(DURATION);setMode('ended');stage.dataset.visual='film';status.textContent='All six perspectives are revealed. The cube is complete.';});
video.addEventListener('waiting',()=>{if(mode==='playing')buffer.hidden=false;});
video.addEventListener('playing',()=>{buffer.hidden=true;});
video.addEventListener('error',()=>{if(video.getAttribute('src'))fallback();});
function maybeAuto(){
 if(!autoAttempted&&mode==='idle'&&allowAutoplay({
   contentReady,inView,hidden:document.hidden,reduced:reduced.matches,
   saveData:Boolean(navigator.connection?.saveData),effectiveType:navigator.connection?.effectiveType
 })){autoAttempted=true;moveTo(0,true,{restart:true});}
}
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting&&e.intersectionRatio>=.2);if(inView)maybeAuto();else if(mode==='playing'||mode==='loading')pause();},{threshold:[0,.2]}).observe(stage);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(mode==='playing'||mode==='loading')pause();}else maybeAuto();});
function respectMotion(){if(staticMode()){pause();autoAttempted=true;poster.src=asset('ending.webp');poster.alt='The complete perspective cube, with all six artworks aligned.';stage.dataset.visual='poster';sync(DURATION);setMode('ended');document.querySelector('#static-note').hidden=false;}}
reduced.addEventListener('change',respectMotion);sync(0);setMode('idle');respectMotion();
document.body.classList.add('cube-ready');
// The text, opening image and fonts take priority. Idle scheduling is optional;
// the animation remains fully usable through its explicit play control.
const pageLoaded=document.readyState==='complete'?Promise.resolve():new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
Promise.allSettled([pageLoaded,document.fonts?.ready,poster.decode?.()]).then(()=>{
 setTimeout(()=>{
   const ready=()=>{contentReady=true;maybeAuto();};
   if('requestIdleCallback' in window)requestIdleCallback(ready,{timeout:4000});
   else setTimeout(ready,250);
 },750);
});
navigator.connection?.addEventListener('change',()=>{respectMotion();maybeAuto();});
