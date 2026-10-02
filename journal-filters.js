/* Progressive enhancement: every entry remains readable without JavaScript. */
(() => {
  const notes=document.querySelector('.grid.gless'), logbook=document.querySelector('.grid.logbook');
  if(!notes||!logbook)return;
  const stories=[...logbook.querySelectorAll('.jcard')], essays=[...notes.querySelectorAll('.jcard')];
  const topicButtons=[...document.querySelectorAll('[data-f]')];
  const formatButtons=[...document.querySelectorAll('[data-format]')];
  let topic='all', format='all';
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
    notes.hidden=!showNotes; document.getElementById('notes-heading').hidden=!showNotes;
    const showLogbook=format!=='essays';
    ['logbook-heading','logbook-note','topic-filters'].forEach(id=>document.getElementById(id).hidden=!showLogbook);
    logbook.hidden=!showLogbook;
    let count=0;
    for(const card of stories){
      const external=new URL(card.href).hostname!==location.hostname;
      const matches=showLogbook&&(topic==='all'||category(card)===topic)&&(format==='all'||(format==='linkedin'&&external)||(format==='stories'&&!external));
      card.hidden=!matches;if(matches)count++;
    }
    document.getElementById('filter-empty').hidden=!showLogbook||count>0;
    document.getElementById('reading-status').textContent=(showNotes?essays.length+' original essays':'')+(showNotes&&showLogbook?' · ':'')+(showLogbook?count+' logbook entries':'');
    for(const [buttons,key,selected] of [[topicButtons,'f',topic],[formatButtons,'format',format]]){
      for(const button of buttons){const on=button.dataset[key]===selected;button.setAttribute('aria-pressed',String(on));button.classList.toggle('on',on);}
    }
  }
  for(const button of topicButtons)button.addEventListener('click',()=>{topic=button.dataset.f;render();});
  for(const button of formatButtons)button.addEventListener('click',()=>{format=button.dataset.format;topic='all';render();});
  render();
})();
