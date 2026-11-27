/* Scoped enhancement. Without JS, the full HTML composition remains visible. */
document.querySelectorAll('.simurg-finance-ecosystem').forEach(root=>{
  const graph=root.querySelector('.simurg-finance-ecosystem__graph');
  const hub=root.querySelector('.simurg-finance-ecosystem__hub');
  const svg=root.querySelector('.simurg-finance-ecosystem__connections');
  const pulse=root.querySelector('.simurg-finance-ecosystem__pulse');
  const cards=[...root.querySelectorAll('[data-direction]')];
  const groups=new Map([...svg.querySelectorAll('[data-connection]')].map(g=>[g.dataset.connection,g]));
  const wide=matchMedia('(min-width:1200px)'), hover=matchMedia('(hover:hover) and (pointer:fine)'), reduce=matchMedia('(prefers-reduced-motion:reduce)');
  let active=null, frame=0, visible=true, resizeFrame=0;
  const cancel=()=>{cancelAnimationFrame(frame);frame=0;pulse.style.opacity='0';root.dataset.motion='idle';};
  const clear=()=>{cancel();active=null;cards.forEach(c=>c.classList.remove('is-active'));groups.forEach(g=>g.classList.remove('is-active'));delete root.dataset.active;};
  function layout(){
    clear(); if(!wide.matches)return;
    const b=graph.getBoundingClientRect(), h=hub.getBoundingClientRect();
    svg.setAttribute('viewBox',`0 0 ${b.width} ${b.height}`);
    cards.forEach(card=>{
      const key=card.dataset.direction, c=card.getBoundingClientRect();
      const left=key==='payments'||key==='finance', top=key==='payments'||key==='risk';
      const x1=(left?c.right:c.left)-b.left, y1=c.top+c.height/2-b.top;
      const x2=(left?h.left:h.right)-b.left, y2=h.top+h.height*(top?.3:.7)-b.top;
      const dx=(x2-x1)*.45;
      const g=groups.get(key), path=g.querySelector('path'), ends=g.querySelectorAll('circle');
      path.setAttribute('d',`M ${x1} ${y1} C ${x1+dx} ${y1}, ${x2-dx} ${y2}, ${x2} ${y2}`);
      ends[0].setAttribute('cx',x1);ends[0].setAttribute('cy',y1);ends[1].setAttribute('cx',x2);ends[1].setAttribute('cy',y2);
    });
  }
  function activate(card,event){
    if(!hover.matches||event.pointerType==='touch'||!visible)return;
    if(active===card)return;clear();active=card;card.classList.add('is-active');root.dataset.active=card.dataset.direction;
    const group=groups.get(card.dataset.direction);group.classList.add('is-active');
    if(!wide.matches||reduce.matches)return;
    const path=group.querySelector('path'), length=path.getTotalLength();
    const duration=parseFloat(getComputedStyle(root).getPropertyValue('--sfe-travel-ms'))||1000;
    const start=performance.now();root.dataset.motion='running';
    function tick(now){
      const t=Math.min(1,(now-start)/duration), p=path.getPointAtLength(length*t);
      pulse.setAttribute('cx',p.x);pulse.setAttribute('cy',p.y);
      pulse.style.opacity=String(Math.min(1,t*8,(1-t)*8));
      if(t<1){frame=requestAnimationFrame(tick)}else{frame=0;pulse.style.opacity='0';root.dataset.motion='complete'}
    }
    frame=requestAnimationFrame(tick);
  }
  cards.forEach(card=>{
    card.addEventListener('pointerenter',event=>activate(card,event));
    card.addEventListener('pointerleave',()=>{if(active===card)clear()});
  });
  const resize=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(layout)});
  resize.observe(graph);resize.observe(hub);cards.forEach(card=>resize.observe(card));
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)clear()}).observe(root);
  [wide,hover,reduce].forEach(query=>query.addEventListener('change',layout));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});
  document.fonts?.ready.then(layout);layout();
});
