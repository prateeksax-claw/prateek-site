/* Progressive enhancement: every entry remains readable without JavaScript. */
(() => {
  const notes=document.querySelector('.grid.gless'), logbook=document.querySelector('.grid.logbook');
  if(!notes||!logbook)return;
  const stories=[...logbook.querySelectorAll('.jcard')], essays=[...notes.querySelectorAll('.jcard')];
  const topicButtons=[...document.querySelectorAll('[data-f]')];
  const formatButtons=[...document.querySelectorAll('[data-format]')];
  const pageSize=8, pages=document.getElementById('journal-pages');
  let topic='all', format='all', page=1;
  function readLocation(){
    const query=new URLSearchParams(location.search);
    format=formatButtons.some(b=>b.dataset.format===query.get('format'))?query.get('format'):'all';
    topic=topicButtons.some(b=>b.dataset.f===query.get('topic'))?query.get('topic'):'all';
    if(format==='essays')topic='all';
    page=Math.max(1,parseInt(query.get('page'),10)||1);
  }
  function navigate(){
    const url=new URL(location.href);
    for(const [key,value] of [['format',format],['topic',topic],['page',String(page)]]){
      if(value==='all'||key==='page'&&value==='1')url.searchParams.delete(key);else url.searchParams.set(key,value);
    }
    if(url.href!==location.href)history.pushState(null,'',url);
    render();
  }
  function category(card){
    const text=card.querySelector('.jdate')?.textContent.toLowerCase()||'';
    if(text.includes('partnership'))return 'partnerships';
    if(text.includes('recognition'))return 'recognition';
    if(text.includes('milestone')||text.includes('launch'))return 'milestones';
    if(text.includes('perspective'))return 'perspectives';
    return 'community';
  }
  function render(){
    const showNotes=format==='all'||format==='essays';
    notes.hidden=!showNotes;
    for(const id of ['notes-heading','ranking-note'])document.getElementById(id).hidden=!showNotes;
    const showLogbook=format!=='essays';
    ['logbook-heading','logbook-note','topic-filters'].forEach(id=>document.getElementById(id).hidden=!showLogbook);
    logbook.hidden=!showLogbook;
    const matches=stories.filter(card=>{
      const external=new URL(card.href).hostname!==location.hostname;
      return showLogbook&&(topic==='all'||category(card)===topic)&&(format==='all'||(format==='linkedin'&&external)||(format==='stories'&&!external));
    });
    const count=matches.length,total=Math.ceil(count/pageSize);
    page=Math.min(page,Math.max(total,1));
    const start=(page-1)*pageSize,shown=new Set(matches.slice(start,start+pageSize));
    for(const card of stories)card.hidden=!shown.has(card);
    document.getElementById('filter-empty').hidden=!showLogbook||count>0;
    document.getElementById('reading-status').textContent=(showNotes?essays.length+' original essays':'')+(showNotes&&showLogbook?' · ':'')+(showLogbook?count+' logbook entries':'');
    pages.hidden=total<2;pages.replaceChildren();
    if(total>1){
      const label=document.createElement('span');label.textContent=`Showing ${start+1}–${Math.min(start+pageSize,count)} of ${count}`;pages.append(label);
      for(let n=1;n<=total;n++){
        const link=document.createElement('a'),url=new URL(location.href);
        if(n===1)url.searchParams.delete('page');else url.searchParams.set('page',String(n));
        link.href=url.href;link.textContent=String(n);link.setAttribute('aria-label',`Logbook page ${n}`);
        if(n===page)link.setAttribute('aria-current','page');
        link.addEventListener('click',event=>{
          if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
          event.preventDefault();page=n;navigate();
          const heading=document.getElementById('logbook-heading');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});
        });pages.append(link);
      }
    }
    for(const [buttons,key,selected] of [[topicButtons,'f',topic],[formatButtons,'format',format]]){
      for(const button of buttons){const on=button.dataset[key]===selected;button.setAttribute('aria-pressed',String(on));button.classList.toggle('on',on);}
    }
  }
  for(const button of topicButtons)button.addEventListener('click',()=>{topic=button.dataset.f;page=1;navigate();});
  for(const button of formatButtons)button.addEventListener('click',()=>{format=button.dataset.format;topic='all';page=1;navigate();});
  window.addEventListener('popstate',()=>{readLocation();render();});
  readLocation();render();
})();
