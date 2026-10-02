// Capture only on replay. The approved film is never re-encoded or downloaded twice.
export function captureReplay({stage,video,poster,caption,reduced=false}){
 if(reduced||typeof video.animate!=='function')return null;
 const source=stage.dataset.visual==='film'?video:poster;
 const width=source.videoWidth||source.naturalWidth,height=source.videoHeight||source.naturalHeight;
 if(!width||!height)return null;
 const frame=stage.ownerDocument.createElement('canvas');
 frame.width=width;frame.height=height;frame.className='cube-replay-frame';frame.setAttribute('aria-hidden','true');
 try{const context=frame.getContext('2d');if(!context)return null;context.drawImage(source,0,0,width,height);}catch{return null;}
 stage.append(frame);stage.dataset.transition='holding';
 let disposed=false;const animations=[];
 const animate=(element,frames,options)=>{const animation=element.animate(frames,{fill:'both',...options});animations.push(animation);return animation.finished.catch(()=>{});};
 const cancel=()=>{if(disposed)return;disposed=true;animations.forEach(a=>a.cancel());frame.remove();delete stage.dataset.transition;};
 return {cancel,async reveal(resetCaption){
   if(disposed)return false;
   stage.dataset.transition='dissolving';
   // Stagger the two silhouettes so the new cube emerges without a hard cut.
   const outgoing=animate(frame,[{opacity:1,transform:'scale(1)',offset:0},{opacity:0,transform:'scale(1.025)',offset:.64},{opacity:0,transform:'scale(1.025)',offset:1}],{duration:1000,easing:'cubic-bezier(.4,0,.2,1)'});
   const incoming=animate(video,[{opacity:0,transform:'scale(.985)',offset:0},{opacity:0,transform:'scale(.985)',offset:.24},{opacity:1,transform:'scale(1)',offset:1}],{duration:1000,easing:'cubic-bezier(.22,1,.36,1)'});
   await animate(caption,[{opacity:1},{opacity:0}],{duration:180,easing:'ease-out'});
   if(disposed)return false;
   resetCaption();
   const words=animate(caption,[{opacity:0},{opacity:1}],{duration:640,delay:120,easing:'ease-in-out'});
   await Promise.all([outgoing,incoming,words]);
   if(disposed)return false;
   cancel();return true;
 }};
}
