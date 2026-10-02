import {readFileSync,writeFileSync} from 'node:fs';

// One catch-all rule: duplicate path blocks can discard the security policy.
const path=new URL('./.pages-output/_headers',import.meta.url);
const source=readFileSync(path,'utf8');
if((source.match(/^\/\*\s*$/gm)||[]).length!==1) throw new Error('Expected one catch-all header rule');
if(!source.includes('X-Robots-Tag:')) writeFileSync(path,source.replace(/^(\/\*\r?\n)/m,'$1  X-Robots-Tag: noindex, nofollow\n'));
console.log('Preview indexing excluded; shared response headers preserved.');
