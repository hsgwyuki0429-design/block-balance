import test from 'node:test';
import assert from 'node:assert/strict';
import { SHAPES, CELL, rotateCells } from '../src/shapes.js';
import { Matter, createBlock, createWorld, structureBounds } from '../src/physics.js';
const { Composite, Engine, Query }=Matter;
const tick=(engine,n)=>{for(let i=0;i<n;i++)Engine.update(engine,1000/120);};
test('shapes are connected unique cells; four rotations restore them',()=>{
  for(const shape of SHAPES){
    const keys=new Set(shape.cells.map(c=>c.join(',')));assert.equal(keys.size,shape.cells.length);
    const seen=new Set(), queue=[shape.cells[0]];
    while(queue.length){const [x,y]=queue.pop(),key=`${x},${y}`;if(seen.has(key)||!keys.has(key))continue;seen.add(key);queue.push([x-1,y],[x+1,y],[x,y-1],[x,y+1]);}
    assert.equal(seen.size,keys.size);
    let cells=shape.cells;for(let i=0;i<4;i++)cells=rotateCells(cells);assert.deepEqual(cells,shape.cells);
  }
});
test('one fixed cell supports a centred bridge',()=>{
  const {engine,base}=createWorld();assert.equal(base.isStatic,true);assert.equal(base.area,CELL*CELL);
  const block=createBlock(SHAPES[0],0,-200);Composite.add(engine.world,block);tick(engine,1200);
  assert.ok(Math.abs(block.position.x)<1);assert.ok(Math.abs(block.position.y+40)<2);assert.ok(Math.abs(block.angle)<0.02);assert.deepEqual(base.position,{x:0,y:0});
});
test('concavity remains empty and cell area is conserved',()=>{
  const shape=SHAPES.find(s=>s.name==='コの字');const block=createBlock(shape,0,0);assert.equal(block.area,shape.cells.length*CELL*CELL);
  const first=block.parts[1].position;assert.equal(Query.point([block],{x:first.x+CELL,y:first.y+CELL}).length,0);assert.equal(Query.point([block],first).length,1);
});
test('off-centre bridge tips and falls without pulling camera down',()=>{
  const {engine}=createWorld();const block=createBlock(SHAPES[0],105,-160);Composite.add(engine.world,block);tick(engine,900);
  assert.ok(Math.abs(block.angle)>0.1);assert.ok(block.position.y>1000);
  assert.deepEqual(structureBounds(Composite.allBodies(engine.world)),{minX:-20,maxX:20,minY:-20});
});
