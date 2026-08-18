const Matter = require('matter-js');
const engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
const cue = Matter.Bodies.circle(0, 0, 10, { density: 0.05 });
Matter.World.add(engine.world, cue);
Matter.Body.applyForce(cue, cue.position, { x: 0.08, y: 0 });
Matter.Engine.update(engine, 16.666);
console.log("Velocity after 1 frame:", cue.velocity);
