(() => {
  const tool=document.getElementById('preflight-tool');
  if(!tool)return;
  const checks=[...tool.querySelectorAll('input[type=checkbox]')], status=tool.querySelector('[role=status]');
  const update=()=>{
    const count=checks.filter(c=>c.checked).length;
    status.textContent=count+' of 5 checks reviewed. '+(count===5?'Bring the evidence and remaining decisions to your team review.':'Work through the remaining checks before your team review.');
  };
  tool.addEventListener('change',update);
  tool.querySelector('[data-preflight-print]').hidden=false;
  tool.querySelector('[data-preflight-print]').addEventListener('click',()=>{
    tool.querySelectorAll('.print-value').forEach(el=>el.remove());
    tool.querySelectorAll('.tool-field input,.tool-field textarea').forEach(field=>{
      const value=document.createElement('div');value.className='print-value';
      value.textContent=field.value.trim()||'Not recorded';field.after(value);
    });
    document.body.classList.add('preflight-printing');
    window.print();
    document.body.classList.remove('preflight-printing');
  });
  window.addEventListener('afterprint',()=>document.body.classList.remove('preflight-printing'));
  update();
})();
