import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync('journal-filters.js','utf8');
function setup(search=''){
 const element=()=>({hidden:false,textContent:'',children:[],attrs:{},handlers:{},classList:{toggle(){}},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,f){this.handlers[k]=f},replaceChildren(){this.children=[]},append(n){this.children.push(n)},focus(){this.focused=true},scrollIntoView(){this.scrolled=true}});
 const topics=['all','partnerships','recognition','milestones','community','perspectives'].map(f=>({...element(),dataset:{f}}));
 const formats=['all','essays','stories','linkedin'].map(format=>({...element(),dataset:{format}}));
 const stories=Array.from({length:28},(_,i)=>({...element(),href:i<10?'https://example.test/journal/story-'+i:'https://www.linkedin.com/posts/'+i,querySelector:()=>({textContent:i%2?'Recognition':'Partnership'})}));
 const essays=Array.from({length:4},element),notes={...element(),querySelectorAll:()=>essays},logbook={...element(),querySelectorAll:()=>stories};
 const ids=Object.fromEntries(['notes-heading','ranking-note','logbook-heading','logbook-note','topic-filters','filter-empty','reading-status','journal-pages'].map(id=>[id,element()]));
 const location=new URL('https://example.test/journal'+search),events={};
 const document={querySelector:s=>s==='.grid.gless'?notes:logbook,querySelectorAll:s=>s==='[data-f]'?topics:formats,getElementById:id=>ids[id],createElement:element};
 vm.runInNewContext(code,{document,location,URL,URLSearchParams,history:{pushState(_s,_t,url){location.href=url.href}},window:{addEventListener:(e,f)=>events[e]=f}});
 return {stories,notes,ids,location,events,format:value=>formats.find(x=>x.dataset.format===value).handlers.click(),topic:value=>topics.find(x=>x.dataset.f===value).handlers.click()};
}
let x=setup();assert.equal(x.stories.filter(s=>!s.hidden).length,8);assert.equal(x.ids['journal-pages'].children.length,5);assert.match(x.ids['reading-status'].textContent,/4 original essays.*28 logbook/);
x.ids['journal-pages'].children[2].handlers.click({button:0,preventDefault(){}});assert.equal(x.location.search,'?page=2');assert.equal(x.stories[8].hidden,false);assert.equal(x.stories[0].hidden,true);assert.equal(x.ids['logbook-heading'].focused,true);
x.format('stories');assert.equal(x.location.search,'?format=stories');assert.equal(x.notes.hidden,true);assert.equal(x.ids['ranking-note'].hidden,true);assert.match(x.ids['reading-status'].textContent,/10 logbook/);
x.topic('partnerships');assert.equal(x.stories.filter(s=>!s.hidden).length,5);assert.equal(x.ids['journal-pages'].hidden,true);
x.location.search='?format=linkedin&topic=recognition&page=2';x.events.popstate();assert.equal(x.stories.filter(s=>!s.hidden).length,1);assert.equal(x.stories[27].hidden,false);
x=setup('?format=essays&topic=partnerships&page=5');assert.equal(x.notes.hidden,false);assert.equal(x.ids['ranking-note'].hidden,false);assert.equal(x.stories.filter(s=>!s.hidden).length,0);assert.equal(x.ids['journal-pages'].hidden,true);
x=setup('?format=unknown&topic=invalid&page=-5');assert.equal(x.notes.hidden,false);assert.equal(x.stories.filter(s=>!s.hidden).length,8);
console.log('Journal filters, pagination, deep links, back/forward state and invalid-input checks passed.');
