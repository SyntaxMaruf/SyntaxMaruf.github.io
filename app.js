'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const githubBase = 'https://github.com/SyntaxMaruf/';
const external = 'target="_blank" rel="noopener noreferrer"';
function decorateArrows(root=document){
  const paths={'↗':'M5 19 19 5M5 5h14v14','↘':'M5 5 19 19M5 19h14V5','↙':'M19 5 5 19M5 5v14h14','↑':'M12 20V4M5 11l7-7 7 7'};
  $$('span[aria-hidden="true"], .file-arrow, .repo-summary-top > a',root).forEach(element=>{const path=paths[element.textContent.trim()];if(path)element.innerHTML=`<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;});
}
const projects = window.portfolioProjects;

function illustration(type) {
  if (type === 'diary') return '<div class="diary-preview"><div class="diary-preview-head"><span>PROGRESSDIARY</span><span>PRIVATE BY ACCOUNT</span></div><h4>Your day.<br><em>Your progress.</em></h4><div class="diary-preview-row"><i></i><span>Plan with purpose</span><b>01</b></div><div class="diary-preview-row"><i></i><span>Record honestly</span><b>02</b></div><div class="diary-preview-row"><i></i><span>Grow at your pace</span><b>03</b></div><div class="diary-preview-foot">OPEN YOUR PERSONAL DIARY ↗</div></div>';

  if (type === 'bus') return '<div class="bus-route-stage"><span class="bus-route-stop bus-stop-start">DIU</span><span class="bus-route-stop bus-stop-end">FARMGATE</span><span class="bus-route-line"></span><svg class="bus-illustration" viewBox="0 0 120 66" aria-hidden="true"><rect x="8" y="10" width="94" height="43" rx="9" fill="#253626" stroke="#b7ef72" stroke-width="2"/><rect x="17" y="17" width="53" height="17" rx="3" fill="#0d1510" stroke="#789769"/><rect x="76" y="17" width="17" height="17" rx="3" fill="#0d1510" stroke="#789769"/><path d="M11 40h88" stroke="#ffb000" stroke-width="3"/><circle cx="31" cy="53" r="7" fill="#0b0f0c" stroke="#d9e8cc"/><circle cx="82" cy="53" r="7" fill="#0b0f0c" stroke="#d9e8cc"/><text x="43" y="29" fill="#b7ef72" stroke="none" font-size="7" font-family="monospace">DIU BUS</text></svg></div>';
  if (type === 'student') return '<div class="student-preview"><div class="student-preview-head">DIU / STUDENT RECORDS <span>LINKED LIST</span></div><div class="student-profile"><span class="student-avatar">S</span><div><strong>Student Management</strong><small>RECORDS / RESULTS / GPA</small></div></div><div class="student-nodes"><span>Student 01</span><b>→</b><span>Student 02</span><b>→</b><span>NULL</span></div><div class="student-preview-foot"><span>ADD · FIND · UPDATE</span><span>C / FILE STORAGE</span></div></div>';
  if (type === 'expense') return '<div class="money-preview"><div class="money-preview-head"><span>PERSONAL FINANCE / C</span><span class="money-status">LOCAL RECORDS</span></div><p class="money-label">BALANCE / BDT</p><strong class="money-balance">869<span>.50</span></strong><div class="money-preview-totals"><div><small>INCOME</small><b>+ 1,000.00</b></div><div><small>EXPENSES</small><b>− 130.50</b></div></div><div class="money-preview-footer"><span>EXACT TO THE POISHA</span><span>01 / MONTHLY VIEW</span></div></div>';
  if (type === 'restaurant') return '<div class="terminal-mini"><div class="terminal-title">RESTAURANT_ORDER_SYSTEM.C</div><div><span class="green">$</span> select your order</div><div>01 Burger&nbsp;&nbsp;&nbsp;149.99</div><div>02 Pizza&nbsp;&nbsp;&nbsp;&nbsp;349.99</div><div class="green">&gt; Generating cash memo_</div></div><div class="receipt"><div class="receipt-title">CASH MEMO</div><div class="receipt-row"><span>Burger × 1</span><span>149.99</span></div><div class="receipt-row"><span>Discount</span><span>−50.00</span></div><div class="receipt-row"><span>VAT (5%)</span><span>5.00</span></div><div class="receipt-row receipt-total"><span>TOTAL</span><span>104.99</span></div><div style="text-align:center;margin-top:9px;font-size:6px">THANK YOU FOR COMING</div></div>';
  return '<div class="browser-mini"><div class="browser-bar"><i></i><i></i><i></i></div><div class="browser-mini-body"><small>SYNTAXMARUF / PORTFOLIO</small><b>Turning logic into<br><em>things that work.</em></b><span class="mini-web-button"></span><span class="mini-web-orbit"></span></div></div>';
}

let filter = 'all';
const initialURL = new URL(location.href);
if (['all','c','web'].includes(initialURL.searchParams.get('filter'))) filter = initialURL.searchParams.get('filter');
$('#project-search').value = initialURL.searchParams.get('q') || '';
function updateURL(key, value) {
  const url = new URL(location.href);
  if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
  try { history.replaceState(null, '', url); } catch { /* Keep local file previews usable. */ }
}
function renderProjects() {
  const query = $('#project-search').value.trim().toLowerCase();
  const shown = projects.filter(p => (filter === 'all' || p.filters.includes(filter)) && `${p.title} ${p.category} ${p.tags.join(' ')} ${p.description} ${p.detail}`.toLowerCase().includes(query));
  $('#project-grid').innerHTML = shown.map(p => `<article class="project-card"><div class="project-visual ${p.visual}-art" aria-hidden="true"><span class="project-corner">${p.visual === 'diary' ? 'YOUR DAY / YOUR PRIVATE SPACE' : p.visual === 'web' ? 'BUILT FOR THE BROWSER' : p.visual === 'restaurant' ? 'FROM MENU TO CASH MEMO' : p.visual === 'bus' ? 'DIU ROUTE / SEAT BOOKING' : p.visual === 'student' ? 'STUDENTS / COURSES / GPA' : p.visual === 'expense' ? 'INCOME / EXPENSE / BALANCE' : 'PERSONAL PROJECT'}</span>${illustration(p.visual)}<span class="visual-index">EXPERIMENT_${p.number}</span></div><div class="card-body"><div class="card-meta"><span class="card-category">${p.category}</span><span class="card-number">${p.number} / ${String(projects.length).padStart(2,'0')}</span></div><h3>${p.title}</h3><p>${p.description}</p><div class="card-bottom"><div class="tags">${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div><button class="project-open" data-project="${p.id}" aria-label="Explore ${p.title}">Explore project <span aria-hidden="true">↗</span></button></div></div></article>`).join('');
  $('#empty-projects').hidden = shown.length > 0;
  $('#project-count').textContent = `${shown.length} ${shown.length === 1 ? 'project' : 'projects'} shown`;
  $$('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  decorateArrows($('#project-grid'));
}
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {filter = button.dataset.filter;updateURL('filter', filter === 'all' ? '' : filter);renderProjects();}));
$('#project-search').addEventListener('input', () => {updateURL('q', $('#project-search').value.trim());renderProjects();});
$('#clear-filters').addEventListener('click', () => {filter = 'all';$('#project-search').value = '';updateURL('filter','');updateURL('q','');renderProjects();$('#project-search').focus();});

const skillSets = {
  programming:[['C','C programming','Loops, conditions & memory','PRACTICING'],['fn','Program logic','Functions, conditions & calculations','PRACTICING'],['{}','Problem solving','Breaking ideas into smaller steps','PRACTICING']],
  web:[['<>','HTML','Page structure & semantic content','BUILDING'],['#','CSS','Layouts, responsive design & styling','LEARNING'],['JS','JavaScript','Browser interactions & DOM updates','LEARNING']],
  tools:[['git','Git & GitHub','Organizing code & version history','PRACTICING'],['VS','VS Code','My web-development workspace','IN USE'],['C::','Code::Blocks','A workspace for C practice','IN USE']]
};
function showSkills(key, focus = false) {
  const buttons = $$('[data-skill]');
  buttons.forEach(b=>{const selected=b.dataset.skill===key;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;if(selected&&focus)b.focus();});
  $('#skills-content').setAttribute('aria-labelledby', `skill-tab-${key}`);
  $('#skills-content').innerHTML = skillSets[key].map(([symbol,title,detail,level])=>`<div class="skill-row"><span class="skill-icon" aria-hidden="true">${escapeHTML(symbol)}</span><div class="skill-info"><h4>${title}</h4><p>${detail}</p></div><span class="skill-level">${level}</span></div>`).join('');
}
$$('[data-skill]').forEach((button,index,buttons)=>{
  button.addEventListener('click',()=>showSkills(button.dataset.skill));
  button.addEventListener('keydown',event=>{let target;if(event.key==='ArrowRight')target=(index+1)%buttons.length;if(event.key==='ArrowLeft')target=(index-1+buttons.length)%buttons.length;if(event.key==='Home')target=0;if(event.key==='End')target=buttons.length-1;if(target!==undefined){event.preventDefault();showSkills(buttons[target].dataset.skill,true);}});
});

let selectedRepo = window.verifiedRepos[0];
const folderIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h7l2 2h9v12H3V6Z"/></svg>';
$('#repo-list').innerHTML=window.verifiedRepos.map(repo=>`<button class="repo-button" data-repo="${repo.id}" aria-pressed="false">${folderIcon}${escapeHTML(repo.name)}</button>`).join('');
function showRepo(id) {
  selectedRepo=window.verifiedRepos.find(r=>r.id===id)||window.verifiedRepos[0];
  $$('[data-repo]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.repo===selectedRepo.id)));
  $('#repo-summary').innerHTML=`<div class="repo-summary-top"><h3>${escapeHTML(selectedRepo.name)} <span class="public-badge">public</span></h3><a href="${githubBase+selectedRepo.name}" ${external} aria-label="Open ${escapeHTML(selectedRepo.name)} on GitHub">↗</a></div><p>${escapeHTML(selectedRepo.description)}</p>`;
  $('#file-search').value='';renderFiles();decorateArrows($('#repo-summary'));
}
function renderFiles(){
  const query=$('#file-search').value.trim().toLowerCase();
  const files=selectedRepo.files.filter(f=>f.name.toLowerCase().includes(query));
  $('#file-count').textContent=`${files.length} / ${selectedRepo.files.length}`;
  $('#repo-files').innerHTML=files.length?files.map(f=>`<a class="file-row" href="${escapeHTML(f.url)}" ${external}><span class="file-symbol" aria-hidden="true">${f.type==='dir'?'▱':f.name.endsWith('.c')?'C':'↳'}</span><span class="file-name">${escapeHTML(f.name)}</span><span class="file-arrow" aria-hidden="true">↗</span><span class="sr-only"> on GitHub (opens in a new tab)</span></a>`).join(''):'<p class="file-empty">No matching files in this repository.</p>';
  decorateArrows($('#repo-files'));
}
$('#repo-list').addEventListener('click',event=>{const b=event.target.closest('[data-repo]');if(b)showRepo(b.dataset.repo);});
$('#file-search').addEventListener('input',renderFiles);

const dialog=$('#project-dialog');
function demoMarkup(project){
  if(project.id==='progressdiary') return '<div class="demo-box"><h3>A real diary, made for your everyday life.</h3><p>Open the app in your browser. Create your personal profile once, then use buttons and forms to keep your own routine and records.</p><div class="feature-map"><div><span>01 / PLAN</span>Seven days, your own rhythm</div><div><span>02 / RECORD</span>Study, rest, spending and reflection</div><div><span>03 / REVIEW</span>Daily reports and weekly perspective</div><div><span>04 / ON THIS DEVICE</span>Saved on this browser only</div></div><p class="demo-caption">Records stay in this browser, separate from the public portfolio. Browser data clearing removes them; keep downloaded backups.</p></div>';

  if(project.id==='restaurant') return '<div class="demo-box"><h3>Try the billing logic</h3><p>A browser adaptation of the C project. Add items, then try <code>maruf50</code>: 50 BDT off a subtotal of at least 100 BDT. VAT is 5% after discount.</p><div class="menu-items">'+[['Burger',149.99],['Pizza',349.99],['Pasta',199.99],['Cold Drinks',39.99]].map(([name,price],index)=>`<div class="menu-item"><span>${name}<small>${price.toFixed(2)} BDT</small></span><div class="quantity"><button data-qty="${index}" data-delta="-1" aria-label="Remove one ${name}">−</button><output id="qty-${index}" aria-label="${name} quantity">0</output><button data-qty="${index}" data-delta="1" aria-label="Add one ${name}">+</button></div></div>`).join('')+'</div><label class="promo-option"><input id="promo" type="checkbox"> Apply maruf50 (50 BDT off eligible orders)</label><div class="bill" role="status" aria-live="polite"><div><span>Subtotal</span><output id="subtotal">0.00 BDT</output></div><div><span>Discount</span><output id="discount">0.00 BDT</output></div><div><span>VAT (5%)</span><output id="vat">0.00 BDT</output></div><div class="bill-total"><span>Grand total</span><output id="total">0.00 BDT</output></div></div><p class="demo-caption">Illustrative calculation only. No orders or payments are submitted.</p></div>';
  if(project.repo) {
    const repo=window.verifiedRepos.find(r=>r.name===project.repo);
    const sourceFiles=repo.files.filter(f=>f.name.endsWith('.c'));
    return `<div class="demo-box"><h3>Explore the implementation</h3><p>${sourceFiles.length} C files in the verified public repository. Choose a file to read its source on GitHub.</p><ul class="source-files-list">${sourceFiles.map(f=>`<li><a href="${escapeHTML(f.url)}" ${external}>${escapeHTML(f.name)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul></div>`;
  }
  return '<div class="demo-box"><h3>Built to be explored</h3><p>Use the filters to follow a particular interest, search the source explorer, or try the billing demo. Everything runs right here in your browser.</p><div class="web-feature-grid"><div class="web-feature"><b>01 / DISCOVER</b>Project filtering and keyword search</div><div class="web-feature"><b>02 / INTERACT</b>Portrait motion and a billing demo</div><div class="web-feature"><b>03 / UNDERSTAND</b>Verified project context and source links</div><div class="web-feature"><b>04 / ANY SCREEN</b>Responsive layouts and keyboard access</div></div><p class="demo-caption">A portfolio project built with assistance. The original C work remains linked to its public repositories.</p></div>';
}
let quantities=[0,0,0,0];
function updateBill(){
  const prices=[14999,34999,19999,3999];
  const subtotal=quantities.reduce((sum,qty,index)=>sum+qty*prices[index],0);
  const discount=$('#promo').checked&&subtotal>=10000?5000:0;
  const vat=Math.round((subtotal-discount)*.05);
  const money=cents=>(cents/100).toFixed(2)+' BDT';
  quantities.forEach((qty,i)=>{$(`#qty-${i}`).textContent=qty;const minus=$(`[data-qty="${i}"][data-delta="-1"]`);minus.disabled=qty===0;const plus=$(`[data-qty="${i}"][data-delta="1"]`);plus.disabled=qty>=99;});
  $('#subtotal').textContent=money(subtotal);$('#discount').textContent=(discount?'−':'')+money(discount);$('#vat').textContent=money(vat);$('#total').textContent=money(subtotal-discount+vat);
}
function openProject(id){
  const project=projects.find(p=>p.id===id);if(!project)return;
  $('#dialog-content').innerHTML=`<div class="dialog-body"><span class="detail-label">${project.category}</span><h2 id="dialog-title">${project.title}</h2><p class="dialog-description">${project.detail}</p><ul class="detail-points">${project.points.map(point=>`<li>${point}</li>`).join('')}</ul>${demoMarkup(project)}<div class="dialog-links">${project.appUrl?`<a class="button primary" href="${project.appUrl}" ${external}>Open ProgressDiary <span aria-hidden="true">↗</span></a>`:project.repo?`<a class="button primary" href="${githubBase+project.repo}" ${external}>View repository <span aria-hidden="true">↗</span></a>`:'<button class="button primary" id="continue-exploring">Continue exploring <span aria-hidden="true">↘</span></button>'}<button class="text-link" id="details-done" style="background:transparent;border:0;padding:7px 0">Back to projects <span aria-hidden="true">↙</span></button></div></div>`;
  if(project.id==='restaurant'){quantities=[0,0,0,0];updateBill();$('#promo').addEventListener('change',updateBill);}
  decorateArrows(dialog);updateURL('project',id);document.body.classList.add('modal-open');dialog.showModal();dialog.scrollTop=0;
}
$('#project-grid').addEventListener('click',event=>{const button=event.target.closest('[data-project]');if(button)openProject(button.dataset.project);});
$('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target===dialog)dialog.close();
  const qty=event.target.closest('[data-qty]');if(qty){const index=Number(qty.dataset.qty);quantities[index]=Math.min(99,Math.max(0,quantities[index]+Number(qty.dataset.delta)));updateBill();}
  if(event.target.closest('#details-done'))dialog.close();
  if(event.target.closest('#continue-exploring')){dialog.close();$('#work').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');updateURL('project','');});

const menuToggle=$('.menu-toggle');
function closeMenu(){menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open navigation');$('#navigation').classList.remove('open');}
menuToggle.addEventListener('click',()=>{const isOpen=menuToggle.getAttribute('aria-expanded')==='true';menuToggle.setAttribute('aria-expanded',String(!isOpen));menuToggle.setAttribute('aria-label',isOpen?'Open navigation':'Close navigation');$('#navigation').classList.toggle('open',!isOpen);});
$$('#navigation a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){$$('#navigation a[href^="#"]').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));}});},{rootMargin:'-20% 0px -55% 0px'});
['work','about','github'].forEach(id=>observer.observe(document.getElementById(id)));
renderProjects();showSkills('programming');showRepo('bus');decorateArrows();
$('[data-filter="all"] span').textContent=String(projects.length).padStart(2,'0');
if(projects.some(p=>p.id===initialURL.searchParams.get('project')))openProject(initialURL.searchParams.get('project'));
