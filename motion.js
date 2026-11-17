'use strict';

// Motion starts on for each page visit. The toggle applies to the current visit.
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.getElementById('motion-toggle');
  const scene = document.querySelector('.portrait-scene');
  const role = document.getElementById('live-role');
  const phrases = ['C programming', 'web development', 'practical ideas'];
  let phraseIndex = 0;
  let paused = false;
  let phraseTimer;
  let changeTimer;
  function resetPortrait() {
    if (!scene) return;
    scene.style.setProperty('--pointer-x', '0deg');scene.style.setProperty('--pointer-y', '0deg');
    scene.style.setProperty('--shift-x', '0px');scene.style.setProperty('--shift-y', '0px');
  }
  function applyPreference() {
    document.body.classList.toggle('motion-paused', paused);
    document.body.classList.toggle('motion-enabled', !paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
    toggle.querySelector('span').textContent = paused ? 'Play motion' : 'Pause motion';
    toggle.querySelector('path').setAttribute('d', paused ? 'm8 5 10 7-10 7V5Z' : 'M9 6v12M15 6v12');
    clearInterval(phraseTimer);clearTimeout(changeTimer);role.classList.remove('changing');
    if (paused) resetPortrait();
    if (!paused) phraseTimer = setInterval(() => {
      if (document.hidden) return;
      role.classList.add('changing');
      changeTimer = setTimeout(() => {phraseIndex=(phraseIndex+1)%phrases.length;role.textContent=phrases[phraseIndex];role.classList.remove('changing');},210);
    },3500);
  }
  toggle.addEventListener('click', () => {paused=!paused;applyPreference();});
  applyPreference();
  if(scene){
    scene.addEventListener('pointermove',event=>{
      if(paused||event.pointerType==='touch')return;
      const box=scene.getBoundingClientRect(),x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;
      scene.style.setProperty('--pointer-x',`${-y*7}deg`);scene.style.setProperty('--pointer-y',`${x*9}deg`);
      scene.style.setProperty('--shift-x',`${x*-7}px`);scene.style.setProperty('--shift-y',`${y*-7}px`);
    });
    scene.addEventListener('pointerleave',resetPortrait);
  }
  document.body.classList.add('motion-ready');
  const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});},{threshold:.08});
  document.querySelectorAll('.section-top,.about-copy,.skills-panel,.source-explorer,.connect-inner').forEach(element=>{element.classList.add('reveal');revealObserver.observe(element);});
  const progress=document.querySelector('.scroll-progress');let ticking=false;
  function updateProgress(){const total=document.documentElement.scrollHeight-window.innerHeight;progress.style.transform=`scaleX(${total>0?Math.min(1,Math.max(0,window.scrollY/total)):0})`;ticking=false;}
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateProgress);ticking=true;}},{passive:true});
  window.addEventListener('resize',updateProgress);updateProgress();
})();
