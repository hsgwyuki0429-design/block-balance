import './style.css';
import { CELL, candidate, rotateCells } from './shapes.js';
import { Matter, createBlock, createWorld, structureBounds } from './physics.js';
import { cameraFor, clampAim } from './view.js';
const { Engine, Composite } = Matter;
const $ = id=>document.getElementById(id);
const canvas=$('game'), ctx=canvas.getContext('2d');
let world, pieces=[], selected=0, aim=0, dropped=0, lost=0, paused=false, cooldown=0;
let camera={x:0,y:-180,scale:1}, view={w:900,h:500}, pointer=null;
let accumulator=0, last=performance.now(), preview;
const heldKeys = new Set();
let heldButton = 0;
const PLAY_SPEED = 0.55;
function refreshPreview(){ preview=createBlock(pieces[selected],0,0); }
function renderChoices(){
  $('choices').replaceChildren(...pieces.map((p,i)=>{
    const button=document.createElement('button'); button.className='choice'; button.setAttribute('aria-pressed',String(i===selected));
    button.setAttribute('aria-label',`${i+1}: ${p.name}`);
    const w=Math.max(...p.cells.map(c=>c[0]))+1, h=Math.max(...p.cells.map(c=>c[1]))+1;
    button.innerHTML=`<svg viewBox="-1 -1 ${w*12+2} ${h*12+2}" aria-hidden="true">${p.cells.map(([x,y])=>`<rect x="${x*12}" y="${y*12}" width="11" height="11" rx="1" fill="${p.color}"/>`).join('')}</svg><span>${p.name}<small>${i+1} / ${p.cells.length}マス</small></span>`;
    button.onclick=()=>{ selected=i; refreshPreview(); renderChoices(); }; return button;
  }));
}
function reset(){
  if(world){Composite.clear(world.engine.world,false);Engine.clear(world.engine);}
  world=createWorld(); world.engine.gravity.y=Number($('gravity').value);
  pieces=Array.from({length:Number($('choice-count').value)},()=>candidate()); selected=0;
  aim=0; dropped=0;lost=0;paused=false;cooldown=0;accumulator=0;pointer=null;heldKeys.clear();heldButton=0;
  camera={x:0,y:-180,scale:1}; $('pause').textContent='一時停止';
  $('status').textContent='形を選んで、落とす場所を決めよう'; refreshPreview();renderChoices();
}
function spawnY(){
  const bounds=structureBounds(Composite.allBodies(world.engine.world));
  return bounds.minY-130-(preview.bounds.max.y-preview.bounds.min.y)/2;
}
function drop(){
  if(paused||cooldown>0)return;
  const body=createBlock(pieces[selected],aim,spawnY(),Number($('friction').value));
  Composite.add(world.engine.world,body);dropped++;cooldown=0.45;
  pieces[selected]=candidate();refreshPreview();renderChoices();
  $('status').textContent='次の形を選べます。揺れていても続けて落とせます';
}
function rotate(){if(!$('rotation').checked||paused)return;pieces[selected].cells=rotateCells(pieces[selected].cells);refreshPreview();renderChoices();}
$('drop').onclick=drop;$('reset').onclick=reset;$('rotate').onclick=rotate;
$('left').onclick=()=>{aim-=CELL/4;pointer=null;};$('right').onclick=()=>{aim+=CELL/4;pointer=null;};
for(const [id,direction] of [['left',-1],['right',1]]){
  $(id).addEventListener('pointerdown',e=>{heldButton=direction;pointer=null;$(id).setPointerCapture(e.pointerId);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])$(id).addEventListener(event,()=>heldButton=0);
}
$('rotation').onchange=()=>{$('rotate').disabled=!$('rotation').checked;};
$('choice-count').onchange=()=>{pieces=pieces.slice(0,Number($('choice-count').value));while(pieces.length<Number($('choice-count').value))pieces.push(candidate());selected=0;refreshPreview();renderChoices();};
$('pause').onclick=()=>{paused=!paused;accumulator=0;$('pause').textContent=paused?'再開':'一時停止';$('status').textContent=paused?'一時停止中':'形を選んで、落とす場所を決めよう';};
for(const id of ['gravity','friction'])$(id).oninput=()=>{
  $(id+'-value').value=Number($(id).value).toFixed(id==='gravity'?1:2);
  if(id==='gravity')world.engine.gravity.y=Number($(id).value);
  else for(const body of Composite.allBodies(world.engine.world))body.friction=Number($(id).value);
};
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer=e.clientX-r.left;aim=camera.x+(pointer-view.w/2)/camera.scale;});
canvas.addEventListener('pointerdown',e=>{canvas.focus();const r=canvas.getBoundingClientRect();aim=camera.x+(e.clientX-r.left-view.w/2)/camera.scale;pointer=e.clientX-r.left;});
canvas.addEventListener('pointerleave',()=>pointer=null);
canvas.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')pointer=null;});
window.addEventListener('keydown',e=>{
  if(['INPUT','SELECT','SUMMARY'].includes(e.target.tagName)||e.target.closest('details'))return;
  if(['ArrowLeft','ArrowRight','Space','Digit1','Digit2','Digit3','KeyR'].includes(e.code))e.preventDefault();
  if(e.code==='ArrowLeft'||e.code==='ArrowRight'){heldKeys.add(e.code);pointer=null;}
  if(e.code==='Space'&&!e.repeat)drop();if(e.code==='KeyR'&&!e.repeat)rotate();
  const n=Number(e.key)-1;if(n>=0&&n<pieces.length){selected=n;refreshPreview();renderChoices();}
});
window.addEventListener('keyup',e=>heldKeys.delete(e.code));
window.addEventListener('blur',()=>{heldKeys.clear();heldButton=0;pointer=null;});
new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();view={w:r.width,h:r.height};const dpr=window.devicePixelRatio||1;canvas.width=r.width*dpr;canvas.height=r.height*dpr;}).observe(canvas);
function drawBody(body,offsetX=0,offsetY=0,alpha=1){
  ctx.globalAlpha=alpha;
  for(const part of body.parts.length>1?body.parts.slice(1):body.parts){
    ctx.beginPath();part.vertices.forEach((v,i)=>i?ctx.lineTo(v.x+offsetX,v.y+offsetY):ctx.moveTo(v.x+offsetX,v.y+offsetY));ctx.closePath();
    ctx.fillStyle=body.plugin.color;ctx.fill();ctx.strokeStyle='#17252b';ctx.lineWidth=1.3;ctx.stroke();
  }ctx.globalAlpha=1;
}
function frame(now){
  const dt=Math.min((now-last)/1000,0.05);last=now;
  if(!paused){
    accumulator+=dt*PLAY_SPEED;cooldown=Math.max(0,cooldown-dt);
    while(accumulator>=1/120){Engine.update(world.engine,1000/120);accumulator-=1/120;}
    for(const b of Composite.allBodies(world.engine.world))if(!b.isStatic&&b.bounds.min.y>1000){Composite.remove(world.engine.world,b);lost++;}
    const direction=heldButton+Number(heldKeys.has('ArrowRight'))-Number(heldKeys.has('ArrowLeft'));
    aim+=direction*dt*220/camera.scale;
  }
  const bodies=Composite.allBodies(world.engine.world), bounds=structureBounds(bodies), sy=spawnY();
  const top=sy+preview.bounds.min.y-35;
  const target=cameraFor(view,bounds,top);
  const t=1-Math.exp(-dt*5);
  // Expand immediately so the next launch preview never clips above the screen.
  // Ease back in only after the falling body has settled or left the structure.
  camera.scale=target.scale<camera.scale?target.scale:camera.scale+(target.scale-camera.scale)*t;
  camera.x=0;
  camera.y=(view.h/2-(view.h-70))/camera.scale;
  if(pointer!==null)aim=(pointer-view.w/2)/camera.scale;
  aim=clampAim(aim,view.w,camera.scale,preview);
  const dpr=window.devicePixelRatio||1;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,view.w,view.h);
  ctx.translate(view.w/2,view.h/2);ctx.scale(camera.scale,camera.scale);ctx.translate(-camera.x,-camera.y);
  const left=camera.x-view.w/(2*camera.scale), right=camera.x+view.w/(2*camera.scale);
  ctx.strokeStyle='#30434e';ctx.lineWidth=1/camera.scale;ctx.setLineDash([4,8]);ctx.beginPath();ctx.moveTo(left,20);ctx.lineTo(right,20);ctx.stroke();ctx.setLineDash([]);
  for(const b of bodies)drawBody(b,0,0,b.position.y>100?Math.max(0,1-(b.position.y-100)/900):1);
  // The outlined body is the launch position only. No landing prediction.
  drawBody(preview,aim,sy,paused?0.3:0.65);
  ctx.fillStyle='#a8b9c1';ctx.font=`${11/camera.scale}px sans-serif`;ctx.textAlign='center';ctx.fillText('落下開始位置',aim,sy+preview.bounds.min.y-14/camera.scale);
  $('height').textContent=Math.max(0,(-20-bounds.minY)/CELL).toFixed(1);$('width').textContent=((bounds.maxX-bounds.minX)/CELL).toFixed(1);
  $('drops').textContent=dropped;$('lost').textContent=lost;$('drop').disabled=paused||cooldown>0;
  requestAnimationFrame(frame);
}
reset();requestAnimationFrame(frame);
