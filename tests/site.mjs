import {readFileSync, readdirSync, existsSync, statSync} from 'node:fs';
import {resolve,dirname,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=process.cwd();
const files=[...readdirSync(root).filter(f=>f.endsWith('.html')),...readdirSync('journal').filter(f=>f.endsWith('.html')).map(f=>'journal/'+f)];
const html=new Map(files.map(f=>[resolve(f),readFileSync(f,'utf8')]));
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"');
let checks=0;
function check(value,message){assert.ok(value,message);checks++;}
for(const [file,text] of html){
 if(file.endsWith('404.html'))continue;
 check((text.match(/<h1\b/g)||[]).length===1,`${file}: one H1`);
 check(/<dialog\b[^>]*id="mmenu"[^>]*inert/.test(text),`${file}: closed native dialog`);
 check(/<script[^>]*src="\/analytics.js"/.test(text),`${file}: centralized analytics`);
 check(!/<script[^>]*src="https?:\/\//.test(text),`${file}: no eager third-party scripts`);
 check(!/lenis\.min\.js|unpkg\.com|three\.module/.test(text),`${file}: no expensive legacy motion dependency`);
 const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 check(ids.length===new Set(ids).size,`${file}: unique IDs`);
 for(const m of text.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){JSON.parse(m[1]);checks++;}
 for(const m of text.matchAll(/\b(?:src|href)="([^"]+)"/g)){
  const value=decode(m[1]);if(/^(?:https?:|mailto:|data:|tel:|\/\/)/.test(value))continue;
  const u=new URL(value,'https://local.test/'+file.slice(root.length+1).replaceAll('\\','/'));
  let target=resolve(root,decodeURIComponent(u.pathname).slice(1));
  if(!extname(target)&&existsSync(target+'.html'))target+='.html';
  else if(existsSync(target)&&statSync(target).isDirectory())target=resolve(target,'index.html');
  check(existsSync(target),`${file}: ${value} exists`);
  if(u.hash&&html.has(target))check(html.get(target).includes(`id="${decodeURIComponent(u.hash.slice(1))}"`),`${file}: ${value} anchor`);
 }
}
const generated=['index.html','src/home.html','journal.html','sitemap.xml','llms.txt','feed.xml'];
const before=generated.map(f=>readFileSync(f,'utf8'));
execFileSync(process.execPath,['build.mjs']);
check(generated.every((f,i)=>readFileSync(f,'utf8')===before[i]),'Build is repeatable without spurious freshness changes');
check(readFileSync('llms.txt','utf8').includes(']('),'llms.txt uses actual Markdown links');
check(readFileSync('sitemap.xml','utf8').includes('/privacy</loc>'),'Privacy is in the sitemap');
execFileSync(process.execPath,['prepare-deploy.mjs']);
for(const privatePath of ['src','tests','data','.git','.github','BUILD.md','SEO-AI-STRATEGY.md','build.mjs','prepare-deploy.mjs']){
 check(!existsSync(resolve('.pages-output',privatePath)),`Deployment excludes ${privatePath}`);
}
for(const publicPath of ['index.html','privacy.html','journal/vibe-coding-in-a-suit.html','analytics.js','_headers','_redirects','robots.txt','manifest.json']){
 check(existsSync(resolve('.pages-output',publicPath)),`Deployment includes ${publicPath}`);
}
console.log(JSON.stringify({pages:files.length,checks,result:'passed'}));
