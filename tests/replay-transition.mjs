import assert from 'node:assert/strict';
import {captureReplay} from '../perspective/v1/replay-transition.mjs';

function fixture(){
 const animations=[];let allocations=0,drawn;
 function animate(frames,options){
   let resolve,reject;
   const finished=new Promise((ok,bad)=>{resolve=ok;reject=bad;});
   const animation={finished,frames,options,cancelled:false,finish:resolve,cancel(){this.cancelled=true;reject(new Error('Cancelled'));}};
   animations.push(animation);return animation;
 }
 const frame={animate,removed:false,setAttribute(){},remove(){this.removed=true;},getContext(){return {drawImage(source){drawn=source;}};}};
 const stage={dataset:{visual:'film'},append(child){this.child=child;},ownerDocument:{createElement(){allocations++;return frame;}}};
 const video={videoWidth:768,videoHeight:768,animate},poster={naturalWidth:768,naturalHeight:768},caption={animate};
 return {stage,video,poster,caption,frame,animations,get allocations(){return allocations;},get drawn(){return drawn;}};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));

// Respect motion preferences without allocating a bitmap or starting animations.
let f=fixture();assert.equal(captureReplay({...f,reduced:true}),null);assert.equal(f.allocations,0);
f=fixture();delete f.video.animate;assert.equal(captureReplay(f),null);assert.equal(f.allocations,0);
f=fixture();f.video.videoWidth=0;assert.equal(captureReplay(f),null);
f=fixture();f.frame.getContext=()=>({drawImage(){throw new Error('Undrawable');}});assert.equal(captureReplay(f),null);assert.equal(f.stage.child,undefined);

// Keep the actual outgoing frame until the new one can be revealed.
f=fixture();let transition=captureReplay(f);assert.equal(f.drawn,f.video);assert.equal(f.stage.dataset.transition,'holding');
let resetCount=0;let result=transition.reveal(()=>resetCount++);
assert.equal(resetCount,0);assert.equal(f.frame.removed,false);
f.animations[2].finish();await tick();assert.equal(resetCount,1);
f.animations.forEach(a=>a.finish());assert.equal(await result,true);
assert.equal(f.frame.removed,true);assert.equal(f.stage.dataset.transition,undefined);assert.ok(f.animations.every(a=>a.cancelled));

// A face selection or offscreen pause cancels all effects and prevents stale captions.
f=fixture();f.stage.dataset.visual='poster';transition=captureReplay(f);assert.equal(f.drawn,f.poster);
resetCount=0;result=transition.reveal(()=>resetCount++);transition.cancel();transition.cancel();
assert.equal(await result,false);assert.equal(resetCount,0);assert.equal(f.frame.removed,true);assert.equal(f.stage.dataset.transition,undefined);
assert.ok(f.animations.every(a=>a.cancelled));assert.equal(await transition.reveal(()=>resetCount++),false);

// Cancellation also works after the caption changed, during the incoming dissolve.
f=fixture();transition=captureReplay(f);result=transition.reveal(()=>{});
f.animations[2].finish();await tick();transition.cancel();assert.equal(await result,false);assert.ok(f.animations.every(a=>a.cancelled));
console.log('Replay frame preservation, completion, interruption and reduced-motion checks passed.');
