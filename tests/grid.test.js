import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,launch,step,supportedIds,matchedIds,LOSS_ROW} from '../src/grid.js';
const block=(id,x,y,color='red',cells=[[0,0]])=>({id,x,y,color,cells});
test('one supporting cell holds an entire overhanging shape',()=>{
 const g=newGame();g.blocks.push(block(1,0,-1,'red',[[0,0],[1,0],[2,0]]));g.busy=true;step(g);
 assert.equal(g.blocks[1].y,-1);assert.equal(g.busy,false);
});
test('unsupported stack falls together without overlapping',()=>{
 const g=newGame();g.blocks.push(block(1,3,-2,'red'),block(2,3,-1,'blue'));g.busy=true;step(g);
 assert.deepEqual(g.blocks.slice(1).map(b=>b.y),[-1,0]);assert.equal(supportedIds(g.blocks).size,1);
});
test('same-color side contact clears entire shapes, not diagonal or own cells',()=>{
 const a=block(1,0,-1,'red',[[0,0],[1,0]]);
 assert.equal(matchedIds([a]).size,0);assert.equal(matchedIds([a,block(2,2,0)]).size,0);
 assert.equal(matchedIds([a,block(2,2,-1)]).size,2);
});
test('clear, unsupported fall, second clear awards a doubled chain',()=>{
 const g=newGame();g.blocks.push(block(1,0,-1,'blue'),block(2,0,-2),block(3,1,-2),block(4,0,-3,'blue'));g.busy=true;
 for(let i=0;i<20;i++)step(g);
 assert.equal(g.score,600);assert.equal(g.combo,2);assert.equal(g.best,2);assert.equal(g.blocks.length,1);assert.equal(g.over,false);assert.equal(g.busy,false);
});
test('falling past the loss row ends the game and blocks future launches',()=>{
 const g=newGame();g.blocks.push(block(1,5,LOSS_ROW-1));g.busy=true;step(g);
 assert.equal(g.over,true);assert.equal(launch(g,block(2,0,0),0),false);
});
test('launch snaps to a column and locks the turn until resolved',()=>{
 const g=newGame();assert.equal(launch(g,block(1,0,0),0.8),true);assert.equal(g.blocks[1].x,1);
 assert.equal(launch(g,block(2,0,0),0),false);assert.equal(g.drops,1);
});
