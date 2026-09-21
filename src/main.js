import './style.css';
import { candidate, rotateCells } from './shapes.js';
import { newGame, launch, step, cellsOf, FALL_INTERVAL, LOSS_ROW } from './grid.js';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');
let game,pieces,selected=0,aim=0,paused=false,elapsed=0,last=performance.now();
let view={w:900,h:500},unit=32,anchor=430,held=0,holdTime=0;
function choices(){
  $('choices').replaceChildren(...pieces.map((p,i)=>{
    const b=document.createElement('button');b.className='choice';b.disabled=game.busy||game.over;
    b.setAttribute('aria-pressed',String(i===selected));b.setAttribute('aria-label',`${i+1}: ${p.name}`);
    const w=Math.max(...p.cells.map(c=>c[0]))+1,h=Math.max(...p.cells.map(c=>c[1]))+1;
    b.innerHTML=`<svg viewBox="-1 -1 ${w*12+2} ${h*12+2}" aria-hidden="true">${p.cells.map(([x,y])=>`<rect x="${x*12}" y="${y*12}" width="11" height="11" fill="${p.color}"/>`).join('')}</svg><span>${p.name}<small>${i+1} / ${p.cells.length}マス</small></span>`;
    b.onclick=()=>{selected=i;choices();};return b;
  }));
}
function reset(){game=newGame();pieces=Array.from({length:3},()=>candidate());selected=0;aim=0;paused=false;held=0;elapsed=0;$('pause').textContent='一時停止';choices();}
function drop(){if(paused)return;if(launch(game,pieces[selected],aim)){pieces[selected]=candidate();elapsed=0;choices();}}
function rotate(){if(paused||game.busy||game.over)return;pieces[selected].cells=rotateCells(pieces[selected].cells);choices();}
function move(d){if(!paused&&!game.busy&&!game.over)aim+=d;}
$('reset').onclick=reset;$('drop').onclick=drop;$('rotate').onclick=rotate;
$('pause').onclick=()=>{if(game.over)return;paused=!paused;held=0;elapsed=0;$('pause').textContent=paused?'再開':'一時停止';};
for(const [id,d] of [['left',-1],['right',1]]){
  $(id).onclick=()=>move(d);
  $(id).onpointerdown=e=>{held=d;holdTime=-0.2;$(id).setPointerCapture(e.pointerId);};
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])$(id).addEventListener(ev,()=>held=0);
}
function point(e){if(paused||game.busy||game.over)return;const r=canvas.getBoundingClientRect();aim=Math.round((e.clientX-r.left-view.w/2)/unit);}
canvas.onpointermove=point;canvas.onpointerdown=e=>{canvas.focus();point(e);};
window.onkeydown=e=>{
  if(e.target.closest('details'))return;
  if(['ArrowLeft','ArrowRight','Space','KeyR','Digit1','Digit2','Digit3'].includes(e.code))e.preventDefault();
  if(e.code==='ArrowLeft')move(-1);if(e.code==='ArrowRight')move(1);
  if(e.code==='Space'&&!e.repeat)drop();if(e.code==='KeyR'&&!e.repeat)rotate();
  const i=Number(e.key)-1;if(i>=0&&i<3&&!game.busy&&!game.over){selected=i;choices();}
};
window.onblur=()=>held=0;
new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();view={w:r.width,h:r.height};const d=devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.height*d;}).observe(canvas);
function paint(cells,color,alpha=1){ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.strokeStyle='#17252b';ctx.lineWidth=1;for(const [x,y] of cells){const sx=view.w/2+(x-0.5)*unit,sy=anchor+(y-0.5)*unit;ctx.fillRect(sx,sy,unit,unit);ctx.strokeRect(sx,sy,unit,unit);}ctx.globalAlpha=1;}
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(!paused&&!game.over){elapsed+=dt;if(elapsed>=FALL_INTERVAL){elapsed-=FALL_INTERVAL;const busy=game.busy;step(game);if(busy!==game.busy)choices();}if(held){holdTime+=dt;if(holdTime>=0.12){move(held);holdTime=0;}}}
  const all=game.blocks.flatMap(cellsOf),p=pieces[selected],top=Math.min(0,...all.map(c=>c[1]));
  const ph=Math.max(...p.cells.map(c=>c[1]))+1,pw=Math.max(...p.cells.map(c=>c[0]))+1,sy=top-ph-3;
  anchor=view.h-70;
  unit=Math.min(40,(anchor-45)/Math.max(8,-sy+1),view.w/(2*(Math.max(5,...all.map(c=>Math.abs(c[0])))+2)));
  const half=Math.floor(view.w/(2*unit)-0.5);aim=Math.max(-half,Math.min(half-pw+1,aim));
  ctx.setTransform(devicePixelRatio||1,0,0,devicePixelRatio||1,0,0);ctx.clearRect(0,0,view.w,view.h);
  ctx.strokeStyle='#273b48';ctx.lineWidth=0.5;
  for(let x=-half-1;x<=half+1;x++){ctx.beginPath();ctx.moveTo(view.w/2+(x-0.5)*unit,0);ctx.lineTo(view.w/2+(x-0.5)*unit,view.h);ctx.stroke();}
  for(let y=Math.floor(-anchor/unit);y<=LOSS_ROW;y++){ctx.beginPath();ctx.moveTo(0,anchor+(y-0.5)*unit);ctx.lineTo(view.w,anchor+(y-0.5)*unit);ctx.stroke();}
  for(const b of game.blocks)paint(cellsOf(b),b.color);
  if(!game.busy&&!game.over){paint(p.cells.map(([x,y])=>[x+aim,y+sy]),p.color,0.65);ctx.fillStyle='#a8b9c1';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('落下開始位置',view.w/2+(aim+(pw-1)/2)*unit,anchor+(sy-1)*unit);}
  if(game.flash.length)paint(game.flash,'#fff',0.7);
  $('score').textContent=game.score.toLocaleString();$('combo').textContent=game.combo;$('best').textContent=game.best;$('drops').textContent=game.drops;
  $('drop').disabled=paused||game.busy||game.over;$('rotate').disabled=paused||game.busy||game.over;
  $('status').textContent=game.over?'ゲームオーバー — 下に落ちました。「はじめから」で再挑戦':paused?'一時停止中':game.busy?(game.combo?`${game.combo}連鎖！ ×${2**Math.min(game.combo-1,20)} — 解決中`:'落下中…'):game.combo?`${game.combo}連鎖！ 次の形を選んでください`:'形を選んで、1マスずつ位置を決めよう';
  if(game.over){ctx.fillStyle='#10181fcc';ctx.fillRect(0,view.h/2-55,view.w,110);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 26px sans-serif';ctx.fillText('GAME OVER',view.w/2,view.h/2-8);ctx.font='16px sans-serif';ctx.fillText(`${game.score.toLocaleString()} 点 ／ 最大 ${game.best} 連鎖`,view.w/2,view.h/2+25);}
  requestAnimationFrame(frame);
}
reset();requestAnimationFrame(frame);
