export const CELL = 40;
export const COLORS = ['#ec987c', '#82b5aa', '#b9a4d4', '#e3c274'];
// 4-neighbour connected cells. Concavities remain empty collision space.
export const SHAPES = [
  { name: '橋', cells: [[0,0],[1,0],[2,0],[3,0],[4,0]] },
  { name: 'コの字', cells: [[0,0],[1,0],[2,0],[0,1],[0,2],[1,2],[2,2]] },
  { name: 'かぎ', cells: [[0,0],[0,1],[0,2],[1,2],[2,2]] },
  { name: '階段', cells: [[0,0],[1,0],[1,1],[2,1],[2,2]] },
  { name: '枝', cells: [[0,0],[1,0],[2,0],[1,1],[1,2],[2,2]] },
  { name: '小さなL', cells: [[0,0],[0,1],[1,1]] },
  { name: '十字', cells: [[1,0],[0,1],[1,1],[2,1],[1,2]] },
  { name: '門', cells: [[0,0],[1,0],[2,0],[3,0],[0,1],[3,1],[0,2],[3,2]] },
  { name: 'ふたつ', cells: [[0,0],[1,0]] },
  { name: 'でこぼこ', cells: [[0,0],[1,0],[2,0],[3,0],[1,1],[3,1],[3,2]] },
];
export function rotateCells(cells) {
  const rotated = cells.map(([x,y]) => [-y,x]);
  const minX = Math.min(...rotated.map(c=>c[0])), minY = Math.min(...rotated.map(c=>c[1]));
  return rotated.map(([x,y])=>[x-minX,y-minY]);
}
export function candidate(random = Math.random) {
  const shape = SHAPES[Math.floor(random()*SHAPES.length)];
  let cells = shape.cells.map(c=>[...c]);
  for (let i=0, n=Math.floor(random()*4); i<n; i++) cells=rotateCells(cells);
  return { name: shape.name, cells, color: COLORS[Math.floor(random()*COLORS.length)] };
}
