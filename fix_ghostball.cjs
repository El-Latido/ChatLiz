const fs = require('fs');

function fixGhostBall() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // 1. Remove the misplaced aim logic from inside useEffect
    const badAimLogicRegex = /\/\/ 8-Ball Advanced Aiming Logic[\s\S]*?(?=return \(\) => \{)/;
    code = code.replace(badAimLogicRegex, "");

    // 2. Insert it before the actual component return
    const mainReturnRegex = /return \(\s*<div className="fixed inset-0/;
    
    const correctAimLogic = `
  // 8-Ball Advanced Aiming Logic
  let ghostBall = null;
  let deflectionLine = null;
  
  if (turn === user.username && cueBall && !isCharging && power === 0) {
      const D = { x: Math.cos(aimAngle), y: Math.sin(aimAngle) };
      let closestT = Infinity;
      let targetBall = null;

      ballPositions.forEach(b => {
          if (b.label === 'cue') return;
          const V = { x: cueBall.x - b.x, y: cueBall.y - b.y };
          const b_coeff = 2 * ((D.x * V.x) + (D.y * V.y));
          const c_coeff = (V.x * V.x) + (V.y * V.y) - (4 * BALL_RADIUS * BALL_RADIUS);
          const disc = (b_coeff * b_coeff) - (4 * c_coeff);
          
          if (disc >= 0) {
              const t1 = (-b_coeff - Math.sqrt(disc)) / 2;
              const t2 = (-b_coeff + Math.sqrt(disc)) / 2;
              if (t1 > 0 && t1 < closestT) { closestT = t1; targetBall = b; }
              else if (t2 > 0 && t2 < closestT) { closestT = t2; targetBall = b; }
          }
      });

      // Check walls if no ball is hit, or if wall is closer
      let wallT = Infinity;
      // Right wall
      if (D.x > 0) wallT = Math.min(wallT, (TABLE_WIDTH - BALL_RADIUS - cueBall.x) / D.x);
      // Left wall
      if (D.x < 0) wallT = Math.min(wallT, (BALL_RADIUS - cueBall.x) / D.x);
      // Bottom wall
      if (D.y > 0) wallT = Math.min(wallT, (TABLE_HEIGHT - BALL_RADIUS - cueBall.y) / D.y);
      // Top wall
      if (D.y < 0) wallT = Math.min(wallT, (BALL_RADIUS - cueBall.y) / D.y);

      if (wallT < closestT) {
          closestT = wallT;
          targetBall = null;
      }

      if (closestT !== Infinity) {
          ghostBall = { x: cueBall.x + D.x * closestT, y: cueBall.y + D.y * closestT };
          
          if (targetBall) {
              const impactNormal = { x: targetBall.x - ghostBall.x, y: targetBall.y - ghostBall.y };
              const dist = Math.sqrt(impactNormal.x*impactNormal.x + impactNormal.y*impactNormal.y);
              impactNormal.x /= dist; impactNormal.y /= dist;
              
              // Target ball path (line passing through target ball center and ghost ball center)
              deflectionLine = {
                  x1: ghostBall.x, y1: ghostBall.y,
                  x2: ghostBall.x + impactNormal.x * 60, y2: ghostBall.y + impactNormal.y * 60
              };
          }
      }
  }

  return (
      <div className="fixed inset-0`;

    code = code.replace(mainReturnRegex, correctAimLogic);

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
    console.log("Fixed ghostBall scope.");
}

fixGhostBall();
