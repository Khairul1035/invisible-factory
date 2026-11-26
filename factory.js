import { stationNames } from './scenarios.js';
// Coordinates use the actual 1672 × 941 asset. Image and interactions share one world.
const regions = [
  ['120,450 305,398 456,445 456,682 256,723 120,670', 275,740],
  ['520,380 692,336 831,386 831,605 660,645 520,595', 670,665],
  ['850,430 945,294 1041,310 1180,382 1180,548 992,590 850,550', 1010,610],
  ['1230,312 1360,275 1484,319 1484,488 1340,520 1230,477', 1360,540]
];

// Only exposed belt runs are traversed. No product is drawn inside opaque machinery
// or over the fixed cartons photographed on the packaging belt.
const conveyorRuns = [
  { id: 'a-b', start: [472, 579], end: [517, 567], count: 2, seconds: 3.4, carton: false },
  { id: 'b-c', start: [848, 516], end: [930, 495], count: 2, seconds: 4.6, carton: false },
  { id: 'd-in', start: [1192, 447], end: [1225, 438], count: 2, seconds: 3.1, carton: true },
  { id: 'd-out', start: [1590, 394], end: [1606, 390], count: 1, seconds: 2.3, carton: true }
];
function productMarkup() {
  return conveyorRuns.map(run => Array.from({ length: run.count }, (_, i) => `<g clip-path="url(#belt-${run.id})"><g class="moving-product ${run.carton ? 'carton' : 'workpiece'}" data-run="${run.id}" data-phase="${i / run.count}" data-start="${run.start}" data-end="${run.end}"><ellipse class="product-shadow" cx="0" cy="0" rx="13" ry="3.5"/><path class="product-front" d="M-12-12L1-7V0L-12-5Z"/><path class="product-side" d="M1-7L13-10V-3L1 0Z"/><path class="product-top" d="M-12-12L0-15 13-10 1-7Z"/><path class="product-seam" d="M-6-13.5L7-8.5"/></g></g>`).join('')).join('');
}
const motionDefs = `<defs>
  <radialGradient id="warm-work-light"><stop stop-color="#ffd493" stop-opacity=".6"/><stop offset="1" stop-color="#eaa84d" stop-opacity="0"/></radialGradient>
  <radialGradient id="neutral-work-light"><stop stop-color="#dae7e5" stop-opacity=".45"/><stop offset="1" stop-color="#c8e0dc" stop-opacity="0"/></radialGradient>
  <clipPath id="work-a"><path d="M280 502L383 480V571L282 596Z"/></clipPath>
  <clipPath id="work-b"><path d="M668 426L782 399V514L669 540Z"/></clipPath>
  <clipPath id="work-c"><path d="M994 381L1080 376L1145 441L1082 466L984 455Z"/></clipPath>
  <clipPath id="work-d"><path d="M1378 368L1446 350V435L1377 456Z"/></clipPath>
  <clipPath id="belt-a-b"><path d="M453 557L539 536V575L453 598Z"/></clipPath>
  <clipPath id="belt-b-c"><path d="M834 495L948 467V508L834 535Z"/></clipPath>
  <clipPath id="belt-d-in"><path d="M1177 429L1240 412V445L1177 463Z"/></clipPath>
  <clipPath id="belt-d-out"><path d="M1577 378L1621 367V401L1577 412Z"/></clipPath>
</defs>`;

export function createFactory(container,onInspect) {
  container.innerHTML=`<svg viewBox="0 0 1672 941" role="group" aria-label="Illustrative factory with four selectable machine regions">${motionDefs}<g id="factory-world"><image href="./assets/factory/factory-environment.png" width="1672" height="941"/><g class="production-effects" aria-hidden="true" pointer-events="none">
  <g class="machine-effect" data-motion-station="0"><g clip-path="url(#work-a)"><ellipse class="work-light" cx="326" cy="551" rx="39" ry="25" fill="url(#warm-work-light)"/><g class="cut-sparks" transform="translate(326 552)"><path class="spark spark-one" d="M0 0l-10 -4m10 4l9 -6m-9 6l4 10"/><path class="spark spark-two" d="M0 0l-13 5m13 -5l10 4m-10 -4l-3 -9"/><circle class="cut-point" r="2.2"/></g></g><circle class="operating-led" cx="204" cy="431" r="4"/></g>
  <g class="machine-effect" data-motion-station="1"><g clip-path="url(#work-b)"><ellipse class="work-light" cx="711" cy="478" rx="46" ry="34" fill="url(#warm-work-light)"/><ellipse class="spindle-glint" cx="704" cy="479" rx="12" ry="16"/></g><circle class="operating-led" cx="591" cy="363" r="4"/></g>
  <g class="machine-effect" data-motion-station="2"><g clip-path="url(#work-c)"><ellipse class="work-light" cx="1043" cy="440" rx="37" ry="16" fill="url(#neutral-work-light)"/><circle class="tool-glint" cx="1017" cy="396" r="3"/></g><circle class="operating-led" cx="1023" cy="412" r="2.5"/></g>
  <g class="machine-effect" data-motion-station="3"><g clip-path="url(#work-d)"><ellipse class="work-light" cx="1400" cy="409" rx="31" ry="34" fill="url(#warm-work-light)"/></g><circle class="operating-led" cx="1315" cy="279" r="4"/></g>
  <g class="conveyor-products">${productMarkup()}</g>
</g><path class="flow-path" d="M472 579L517 567 M848 516L930 495 M1192 447L1225 438 M1590 394L1606 390"/>${regions.map(([points,x,y],i)=>`<g class="machine" data-station="${i}" role="button" tabindex="0" aria-label="Inspect ${stationNames[i]}"><polygon class="machine-outline" points="${points}"/><g class="machine-label" transform="translate(${x-105} ${y})"><rect width="210" height="76" rx="8"/><text class="station-name" x="12" y="24">${String.fromCharCode(65+i)} · ${stationNames[i]}</text><text class="station-capacity" x="12" y="46"></text><text class="station-status" x="12" y="64"></text></g></g>`).join('')}</g></svg>`;
  const svg=container.querySelector('svg'),world=container.querySelector('#factory-world');
  const readout=document.createElement('p');readout.className='motion-readout';readout.id='factory-motion-status';readout.setAttribute('role','status');container.append(readout);
  const shortcuts=document.createElement('div');shortcuts.className='station-shortcuts';shortcuts.setAttribute('role','group');shortcuts.setAttribute('aria-label','Inspect machines');
  shortcuts.innerHTML=stationNames.map((name,i)=>`<button data-inspect="${i}" class="station-shortcut"><strong>${String.fromCharCode(65+i)} · ${name}</strong><span></span></button>`).join('');container.append(shortcuts);
  shortcuts.addEventListener('click',e=>{const button=e.target.closest('[data-inspect]');if(button)onInspect(Number(button.dataset.inspect));});
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let zoom=1,panX=0,panY=0,paused=preference.matches,drag=null;
  let reduced=preference.matches,valid=true,throughput=0,visible=true,currentResult=null;
  const animations=[];
  function animate(element,keyframes,seconds,phase=0) {
    const animation=element.animate(keyframes,{duration:seconds*1000,iterations:Infinity,easing:'linear',fill:'both'});
    animation.pause();animation.currentTime=phase*seconds*1000;animations.push(animation);return animation;
  }
  for(const product of container.querySelectorAll('.moving-product')) {
    const run=conveyorRuns.find(r=>r.id===product.dataset.run),[x,y]=run.start,[ex,ey]=run.end;
    const at=t=>`translate(${x+(ex-x)*t}px, ${y+(ey-y)*t}px)`;
    animate(product,[{transform:at(0),opacity:0,offset:0},{transform:at(.12),opacity:1,offset:.12},{transform:at(.8),opacity:1,offset:.8},{transform:at(1),opacity:0,offset:1}],run.seconds,Number(product.dataset.phase));
  }
  for(const [i,light]of [...container.querySelectorAll('.work-light')].entries())animate(light,[{opacity:.12},{opacity:.47,offset:.4},{opacity:.23,offset:.65},{opacity:.12}],3.8+i*.4,i*.17);
  for(const [i,spark]of [...container.querySelectorAll('.spark,.cut-point')].entries())animate(spark,[{opacity:0},{opacity:0,offset:.58},{opacity:.7,offset:.62},{opacity:.1,offset:.68},{opacity:.55,offset:.71},{opacity:0,offset:.77},{opacity:0}],2.8,i*.08);
  animate(container.querySelector('.spindle-glint'),[{strokeDashoffset:0,opacity:.18},{strokeDashoffset:-44,opacity:.4,offset:.5},{strokeDashoffset:-88,opacity:.18}],2.4);
  animate(container.querySelector('.tool-glint'),[{opacity:.12},{opacity:.6,offset:.5},{opacity:.12}],3.6);
  for(const [i,led]of [...container.querySelectorAll('.operating-led')].entries())animate(led,[{opacity:.6},{opacity:1,offset:.5},{opacity:.6}],4.4,i*.15);
  function syncMotion() {
    const moving=valid&&throughput>0&&!paused&&!reduced&&visible&&!document.hidden;
    container.classList.toggle('paused',paused);container.classList.toggle('motion-held',!moving);
    container.classList.toggle('motion-invalid',!valid);container.classList.toggle('motion-stopped',throughput<=0);container.classList.toggle('motion-reduced',reduced);
    container.dataset.motionState=!valid?'invalid':throughput<=0?'zero-throughput':reduced?'reduced-motion':paused?'paused':!visible||document.hidden?'out-of-view':'running';
    const rate=Number.isFinite(throughput)&&throughput>0?Math.min(3,throughput/800):0;
    container.dataset.motionRate=String(rate);container.style.setProperty('--flow-duration',`${rate>0?4/rate:4}s`);
    for(const animation of animations){if(rate>0&&animation.playbackRate!==rate)animation.updatePlaybackRate(rate);if(moving){if(animation.playState!=='running')animation.play();}else if(animation.playState!=='paused')animation.pause();}
    const message=!valid?'Motion held — inputs pending or invalid. Labels show the last valid configuration.':throughput<=0?'Production flow stopped — zero throughput.':reduced?'Reduced motion — static illustrative factory.':paused?'Animation paused — illustrative flow.':!visible||document.hidden?'Illustrative motion suspended while the factory is out of view.':`Illustrative relative flow · ${throughput.toLocaleString()} units/h · not measured activity`;
    if(readout.textContent!==message)readout.textContent=message;
  }
  function setValidity(value) {
    valid=Boolean(value);
    for(const el of container.querySelectorAll('.machine')){
      const i=Number(el.dataset.station),bottleneck=currentResult?.bottlenecks.includes(i);
      el.querySelector('.station-status').textContent=valid?(bottleneck?'BOTTLENECK':'AVAILABLE CAPACITY'):'LAST VALID · INPUTS PENDING';
      if(currentResult){el.setAttribute('aria-label',`Inspect ${String.fromCharCode(65+i)}: ${stationNames[i]}, ${currentResult.capacities[i]} units per hour${bottleneck?', bottleneck':''}${valid?'':', last valid configuration'}`);const button=shortcuts.querySelector(`[data-inspect="${i}"]`);button.querySelector('span').textContent=`${currentResult.capacities[i].toLocaleString()} units/h${bottleneck?' · Bottleneck':''}${valid?'':' · Last valid'}`;}
    }
    syncMotion();
  }
  document.addEventListener('visibilitychange',syncMotion);
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncMotion();},{threshold:0});observer.observe(svg);}
  const transform=()=>world.setAttribute('transform',`translate(${836+panX} ${470.5+panY}) scale(${zoom}) translate(-836 -470.5)`);
  const select=e=>{const el=e.target.closest('[data-station]');if(el)onInspect(Number(el.dataset.station));};
  svg.addEventListener('click',select);
  svg.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-station]')){e.preventDefault();select(e);}});
  const controls={'zoom-in':()=>zoom=Math.min(2.5,zoom+.2),'zoom-out':()=>zoom=Math.max(.7,zoom-.2),'pan-left':()=>panX=Math.max(-650,panX-80),'pan-right':()=>panX=Math.min(650,panX+80),'pan-up':()=>panY=Math.max(-400,panY-60),'pan-down':()=>panY=Math.min(400,panY+60),'reset-view':()=>{zoom=1;panX=panY=0;}};
  for(const[id,fn]of Object.entries(controls))document.getElementById(id).addEventListener('click',()=>{fn();transform();});
  svg.addEventListener('pointerdown',e=>{if(e.target.closest('[data-station]'))return;drag={x:e.clientX,y:e.clientY,px:panX,py:panY};svg.setPointerCapture(e.pointerId);});
  svg.addEventListener('pointermove',e=>{if(!drag)return;const scale=1672/svg.getBoundingClientRect().width;panX=Math.max(-650,Math.min(650,drag.px+(e.clientX-drag.x)*scale));panY=Math.max(-400,Math.min(400,drag.py+(e.clientY-drag.y)*scale));transform();});
  const end=()=>drag=null;svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  function setPaused(value){paused=value;syncMotion();document.getElementById('pause').textContent=paused?'Resume flow':'Pause flow';document.getElementById('pause').setAttribute('aria-pressed',String(paused));}
  document.getElementById('pause').addEventListener('click',()=>setPaused(!paused));
  preference.addEventListener('change',e=>{reduced=e.matches;if(reduced)setPaused(true);else syncMotion();});setPaused(paused);transform();
  return{setValidity,update(result,selected,isValid=true){currentResult=result;throughput=Number.isFinite(result.throughput)?Math.max(0,result.throughput):0;for(const el of container.querySelectorAll('.machine')){const i=Number(el.dataset.station),bottleneck=result.bottlenecks.includes(i);el.classList.toggle('bottleneck',bottleneck);el.classList.toggle('selected',selected===i);el.setAttribute('aria-pressed',String(selected===i));el.querySelector('.station-capacity').textContent=`${result.capacities[i].toLocaleString()} units/h`;el.querySelector('.station-status').textContent=bottleneck?'BOTTLENECK':'AVAILABLE CAPACITY';el.setAttribute('aria-label',`Inspect ${String.fromCharCode(65+i)}: ${stationNames[i]}, ${result.capacities[i]} units per hour${bottleneck?', bottleneck':''}`);const button=shortcuts.querySelector(`[data-inspect="${i}"]`);button.classList.toggle('bottleneck',bottleneck);button.setAttribute('aria-pressed',String(selected===i));button.querySelector('span').textContent=`${result.capacities[i].toLocaleString()} units/h${bottleneck?' · Bottleneck':''}`;}for(const effect of container.querySelectorAll('[data-motion-station]'))effect.classList.toggle('bottleneck',result.bottlenecks.includes(Number(effect.dataset.motionStation)));setValidity(isValid);}};
}
