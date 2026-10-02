export const DURATION = 30;
export const END_FRAME = 29.966667;
export const FACES = [
  {id:'identity',name:'Identity',symbol:'PS monogram',start:8,hold:8.7,seek:9.7,end:11,line:'A point of view of my own.',detail:'A personal signature. An independent perspective.'},
  {id:'curiosity',name:'Curiosity',symbol:'spiral',start:11,hold:11.7,seek:12.7,end:14,line:'Keep asking. Keep exploring.',detail:'One question opens into another. There is always more to discover.'},
  {id:'expression',name:'Expression',symbol:'calligraphic stroke',start:14,hold:14.7,seek:15.7,end:17,line:'Give ideas a clear form.',detail:'Turn a thought into something others can see and understand.'},
  {id:'connection',name:'Connection',symbol:'woven knot',start:17,hold:17.7,seek:18.7,end:20,line:'See how the pieces relate.',detail:'Find the relationships between people, ideas and systems.'},
  {id:'clarity',name:'Clarity',symbol:'concentric rings',start:20,hold:20.7,seek:21.7,end:23,line:'Find what matters.',detail:'Move through complexity toward a clear focus.'},
  {id:'possibility',name:'Possibility',symbol:'sun and horizon',start:23,hold:23.7,seek:24.7,end:26,line:'See what could come next.',detail:'Stay open to an idea that is still taking shape.'}
];
export function clampTime(value){return Math.min(DURATION,Math.max(0,Number.isFinite(Number(value))?Number(value):0));}
export function chapterAt(value){
  const t=clampTime(value),index=FACES.findIndex(f=>t>=f.start&&t<f.end);
  if(index>=0){const f=FACES[index];return {id:f.id,index,kicker:`0${index+1} / SIX PERSPECTIVES`,title:f.name,line:f.line};}
  if(t>=26)return {id:'complete',index:-1,kicker:'THE COMPLETE PICTURE',title:'Different sides. One perspective.',line:'Six ways of seeing. One way of thinking.'};
  if(t>=7)return {id:'solved',index:-1,kicker:'THE PIECES ARE IN PLACE',title:'A different view on every side.',line:'Six perspectives behind how I think.'};
  return {id:'solve',index:-1,kicker:'THE PERSPECTIVE CUBE',title:'Bringing the pieces together.',line:'Six perspectives behind how I think.'};
}
export function labelFor(mode){return ({idle:'Watch animation',loading:'Preparing animation…',restarting:'Pause replay transition',playing:'Pause animation',paused:'Resume animation',face:'Resume animation',ended:'Replay animation',error:'Try animation again'})[mode]||'Watch animation';}
export function timeLabel(t){return `0:${String(Math.floor(clampTime(t))).padStart(2,'0')}`;}
