export const FALL_INTERVAL = 0.18;
export const LOSS_ROW = 5;
export const cellsOf = b => b.cells.map(([x,y])=>[x+b.x,y+b.y]);
const key=(x,y)=>`${x},${y}`;
export function newGame(){return {blocks:[{id:0,x:0,y:0,cells:[[0,0]],color:'#d7e0e7',fixed:true}],nextId:1,score:0,combo:0,best:0,drops:0,busy:false,over:false,flash:[],flashTime:0};}
export function launch(game,piece,x){
  if(game.busy||game.over)return false;
  const top=Math.min(0,...game.blocks.flatMap(cellsOf).map(c=>c[1]));
  const height=Math.max(...piece.cells.map(c=>c[1]))+1;
  game.blocks.push({...piece,cells:piece.cells.map(c=>[...c]),id:game.nextId++,x:Math.round(x),y:top-height-3});
  game.busy=true;game.combo=0;game.drops++;return true;
}
export function supportedIds(blocks){
  const occupied=new Map();for(const b of blocks)for(const [x,y] of cellsOf(b))occupied.set(key(x,y),b.id);
  const supported=new Set(blocks.filter(b=>b.fixed).map(b=>b.id));
  // Only support paths connected to the foundation count. Floating cycles fall.
  let changed=true;while(changed){changed=false;for(const b of blocks){
    if(supported.has(b.id))continue;
    if(cellsOf(b).some(([x,y])=>supported.has(occupied.get(key(x,y+1))))){supported.add(b.id);changed=true;}
  }}return supported;
}
export function matchedIds(blocks){
  const occupied=new Map(),matches=new Set();
  for(const b of blocks)for(const [x,y] of cellsOf(b))occupied.set(key(x,y),b);
  for(const b of blocks){if(b.fixed)continue;for(const [x,y] of cellsOf(b))for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const other=occupied.get(key(x+dx,y+dy));
    if(other&&!other.fixed&&other.id!==b.id&&other.color===b.color){matches.add(b.id);matches.add(other.id);}
  }}return matches;
}
export function step(game){
  if(game.over||!game.busy)return;
  if(game.flashTime>0){game.flashTime--;if(!game.flashTime)game.flash=[];return;}
  // Contact is checked every grid step, including while a piece is falling.
  const matches=matchedIds(game.blocks);
  if(matches.size){
    const removed=game.blocks.filter(b=>matches.has(b.id));
    game.flash=removed.flatMap(cellsOf);game.flashTime=2;
    game.blocks=game.blocks.filter(b=>!matches.has(b.id));game.combo++;game.best=Math.max(game.best,game.combo);
    game.score+=removed.reduce((sum,b)=>sum+b.cells.length,0)*100*2**Math.min(game.combo-1,20);
    return;
  }
  const support=supportedIds(game.blocks),falling=game.blocks.filter(b=>!support.has(b.id));
  if(!falling.length){game.busy=false;return;}
  for(const b of falling)b.y++;
  if(falling.some(b=>Math.min(...cellsOf(b).map(c=>c[1]))>=LOSS_ROW)){game.over=true;game.busy=false;}
}
