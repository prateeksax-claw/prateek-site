import {readdirSync,copyFileSync,mkdirSync,rmSync,lstatSync,existsSync,realpathSync} from 'node:fs';
import {resolve,dirname,join,extname} from 'node:path';

// Pages must receive a directory containing only public files. Its upload command
// does not enforce the repository's Workers-style .assetsignore file.
const root=realpathSync(process.cwd());
const output=resolve(root,'.pages-output');
if(dirname(output)!==root) throw new Error('Deployment output must stay inside the repository');
if(existsSync(output)) {
  if(lstatSync(output).isSymbolicLink()||realpathSync(output)!==output) throw new Error('Unsafe output path');
  rmSync(output,{recursive:true});
}
mkdirSync(output);
const folders=new Set(['fonts','logos','journal-media','journal','perspective']);
const extensions=new Set(['.html','.css','.js','.png','.jpg','.jpeg','.webp','.svg','.ico','.woff2','.mp4','.mjs']);
const named=new Set(['_headers','_redirects','robots.txt','llms.txt','sitemap.xml','feed.xml','manifest.json','7e4a4aded28b22d590da634a8050a22c.txt','77754d1da1ad06f524236bf31f988c96.txt']);
const unused=new Set(['lenis.min.js','three.core.min.js','three.module.min.js']);
let count=0;
function copyFolder(source,destination){
  mkdirSync(destination,{recursive:true});
  for(const entry of readdirSync(source,{withFileTypes:true})){
    if(entry.isSymbolicLink()) throw new Error('Do not publish symlinked assets');
    if(entry.isDirectory()) copyFolder(join(source,entry.name),join(destination,entry.name));
    else if(extensions.has(extname(entry.name))) {copyFileSync(join(source,entry.name),join(destination,entry.name));count++;}
  }
}
for(const entry of readdirSync(root,{withFileTypes:true})){
  if(entry.isDirectory()&&folders.has(entry.name)) copyFolder(join(root,entry.name),join(output,entry.name));
  else if(entry.isFile()&&!unused.has(entry.name)&&((extensions.has(extname(entry.name))&&extname(entry.name)!=='.mjs')||named.has(entry.name))) {
    copyFileSync(join(root,entry.name),join(output,entry.name));count++;
  }
}
console.log(`Prepared ${count} public files in .pages-output`);
