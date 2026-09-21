import test from 'node:test';
import assert from 'node:assert/strict';
import { cameraFor, clampAim } from '../src/view.js';
test('foundation stays at screen centre horizontally and a fixed vertical anchor',()=>{
  for(const view of [{w:390,h:440},{w:1000,h:590}]){
    for(const bounds of [{minX:-20,maxX:20},{minX:-500,maxX:900}]){
      const camera=cameraFor(view,bounds,-600);
      assert.equal(view.w/2-camera.x*camera.scale,view.w/2);
      assert.ok(Math.abs(view.h/2-camera.y*camera.scale-(view.h-70))<1e-8);
    }
  }
});
test('movement reaches both edges without leaving the viewport or runaway zoom',()=>{
  const preview={bounds:{min:{x:-80},max:{x:40}}};
  assert.equal(clampAim(-1e9,400,1,preview),-108);
  assert.equal(clampAim(1e9,400,1,preview),148);
  assert.equal(clampAim(0,400,1,preview),0);
});
