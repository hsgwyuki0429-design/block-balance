import Matter from 'matter-js';
import { CELL } from './shapes.js';
const { Engine, Bodies, Body, Composite } = Matter;
export function createBlock(piece, x, y, friction=0.65) {
  const parts = piece.cells.map(([cx,cy])=>Bodies.rectangle(cx*CELL,cy*CELL,CELL,CELL));
  const body = Body.create({ parts, friction, frictionStatic: 1, restitution: 0.025, frictionAir: 0.006 });
  Body.setPosition(body,{x,y});
  body.plugin = { color: piece.color, name: piece.name };
  return body;
}
export function createWorld() {
  const engine = Engine.create({ positionIterations: 10, velocityIterations: 8 });
  const base = Bodies.rectangle(0,0,CELL,CELL,{isStatic:true,friction:0.65});
  base.plugin = { color:'#d7e0e7', name:'土台' };
  Composite.add(engine.world,base);
  return { engine, base };
}
export function structureBounds(bodies) {
  // Bodies falling below the foundation must not drag the camera down.
  const visible = bodies.filter(b=>b.bounds.min.y<CELL);
  return { minX:Math.min(-CELL/2,...visible.map(b=>b.bounds.min.x)), maxX:Math.max(CELL/2,...visible.map(b=>b.bounds.max.x)), minY:Math.min(-CELL/2,...visible.map(b=>b.bounds.min.y)) };
}
export { Matter };
