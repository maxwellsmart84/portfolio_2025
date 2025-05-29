'use client';

import { Application, extend } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useCallback, useEffect, useRef, useState } from 'react';

const RUN_FRAME_COUNT = 6;
const IDLE_FRAME_COUNT = 4;
const JUMP_FRAME_COUNT = 4;
const MOVE_SPEED = 4;
const JUMP_FORCE = 12;
const GRAVITY = 0.5;
const GROUND_Y = 250;

// Platform data
const PLATFORMS = [
  { x: 0, y: GROUND_Y, width: 200, height: 50 }, // Ground start
  { x: 300, y: 200, width: 150, height: 20 }, // Platform 1
  { x: 500, y: 150, width: 100, height: 20 }, // Platform 2
  { x: 700, y: GROUND_Y, width: 200, height: 50 }, // Ground end
  { x: 950, y: 180, width: 120, height: 20 }, // Platform 3
];

extend({
  AnimatedSprite: PIXI.AnimatedSprite,
  Container: PIXI.Container,
  Graphics: PIXI.Graphics,
  Sprite: PIXI.Sprite,
});

const Game = () => {
  const animatedRef = useRef<PIXI.AnimatedSprite | null>(null);
  const containerRef = useRef<PIXI.Container | null>(null);
  const [runTextures, setRunTextures] = useState<PIXI.Texture[]>([]);
  const [idleTextures, setIdleTextures] = useState<PIXI.Texture[]>([]);
  const [jumpTextures, setJumpTextures] = useState<PIXI.Texture[]>([]);
  const [appSize] = useState({ width: 800, height: 300 });
  const [isLoading, setIsLoading] = useState(true);

  // Movement state
  const [position, setPosition] = useState({ x: 100, y: GROUND_Y });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [isGrounded, setIsGrounded] = useState(true);
  const keysPressed = useRef<Set<string>>(new Set());

  // Camera state
  const [cameraX, setCameraX] = useState(0);

  // Simple static background (no complex rendering)
  const drawBackground = useCallback((graphics: PIXI.Graphics) => {
    graphics.clear();

    // Simple gradient background
    for (let i = 0; i < 300; i++) {
      const alpha = i / 300;
      const color = {
        r: Math.floor(10 + alpha * 20),
        g: Math.floor(5 + alpha * 15),
        b: Math.floor(20 + alpha * 40),
      };
      const hexColor = (color.r << 16) | (color.g << 8) | color.b;
      graphics.rect(0, i, 1400, 1);
      graphics.fill({ color: hexColor });
    }

    // Simple buildings (static, no windows)
    const buildings = [
      { x: 0, y: 120, width: 80, height: 180 },
      { x: 100, y: 100, width: 60, height: 200 },
      { x: 180, y: 140, width: 70, height: 160 },
      { x: 270, y: 80, width: 90, height: 220 },
      { x: 380, y: 110, width: 75, height: 190 },
      { x: 480, y: 90, width: 100, height: 210 },
      { x: 600, y: 125, width: 70, height: 175 },
      { x: 690, y: 105, width: 80, height: 195 },
      { x: 790, y: 85, width: 95, height: 215 },
      { x: 900, y: 115, width: 75, height: 185 },
      { x: 1000, y: 95, width: 85, height: 205 },
      { x: 1100, y: 135, width: 90, height: 165 },
      { x: 1210, y: 100, width: 70, height: 200 },
    ];

    buildings.forEach(building => {
      graphics.rect(building.x, building.y, building.width, building.height);
      graphics.fill({ color: 0x2d1b3d });
    });

    // Simple ground
    graphics.rect(0, 280, 1400, 20);
    graphics.fill({ color: 0x0a0a0a });

    // Simple neon lines
    graphics.rect(0, 270, 1400, 2);
    graphics.fill({ color: 0xff00ff });
    graphics.rect(0, 285, 1400, 2);
    graphics.fill({ color: 0x00ffff });
  }, []); // No dependencies - static background

  // Platform renderer
  const drawPlatforms = (graphics: PIXI.Graphics) => {
    graphics.clear();
    PLATFORMS.forEach(platform => {
      graphics.rect(platform.x, platform.y, platform.width, platform.height);
      graphics.fill({ color: 0x8b4513 }); // Brown platforms

      // Add border
      graphics.rect(platform.x, platform.y, platform.width, platform.height);
      graphics.stroke({ color: 0x654321, width: 2 });
    });
  };

  useEffect(() => {
    const loadTextures = async () => {
      try {
        console.log('Attempting to load textures...');

        // Load all sprite sheets
        const runTexture = await PIXI.Assets.load('/assets/Punk_run.png');
        const idleTexture = await PIXI.Assets.load('/assets/Punk_idle.png');
        const jumpTexture = await PIXI.Assets.load('/assets/Punk_jump.png');

        console.log('Run texture size:', runTexture.width, 'x', runTexture.height);
        console.log('Idle texture size:', idleTexture.width, 'x', idleTexture.height);
        console.log('Jump texture size:', jumpTexture.width, 'x', jumpTexture.height);

        // Calculate frame sizes for each animation
        const runFrameWidth = runTexture.width / RUN_FRAME_COUNT;
        const runFrameHeight = runTexture.height;
        const idleFrameWidth = idleTexture.width / IDLE_FRAME_COUNT;
        const idleFrameHeight = idleTexture.height;
        const jumpFrameWidth = jumpTexture.width / JUMP_FRAME_COUNT;
        const jumpFrameHeight = jumpTexture.height;

        console.log(`Run frame size: ${runFrameWidth} x ${runFrameHeight}`);
        console.log(`Idle frame size: ${idleFrameWidth} x ${idleFrameHeight}`);
        console.log(`Jump frame size: ${jumpFrameWidth} x ${jumpFrameHeight}`);

        // Create run animation frames
        const run: PIXI.Texture[] = [];
        for (let i = 0; i < RUN_FRAME_COUNT; i++) {
          const frame = new PIXI.Texture({
            source: runTexture.source,
            frame: new PIXI.Rectangle(i * runFrameWidth, 0, runFrameWidth, runFrameHeight),
          });
          run.push(frame);
        }

        // Create idle animation frames
        const idle: PIXI.Texture[] = [];
        for (let i = 0; i < IDLE_FRAME_COUNT; i++) {
          const frame = new PIXI.Texture({
            source: idleTexture.source,
            frame: new PIXI.Rectangle(i * idleFrameWidth, 0, idleFrameWidth, idleFrameHeight),
          });
          idle.push(frame);
        }

        // Create jump animation frames
        const jump: PIXI.Texture[] = [];
        for (let i = 0; i < JUMP_FRAME_COUNT; i++) {
          const frame = new PIXI.Texture({
            source: jumpTexture.source,
            frame: new PIXI.Rectangle(i * jumpFrameWidth, 0, jumpFrameWidth, jumpFrameHeight),
          });
          jump.push(frame);
        }

        console.log(
          `Created ${run.length} run frames, ${idle.length} idle frames, and ${jump.length} jump frames`
        );
        setRunTextures(run);
        setIdleTextures(idle);
        setJumpTextures(jump);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load textures:', error);
        setIsLoading(false);
      }
    };

    loadTextures();
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.key.toLowerCase());
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop for movement and physics
  useEffect(() => {
    const gameLoop = () => {
      const keys = keysPressed.current;
      let newVelX = velocity.x;
      let newVelY = velocity.y;
      let moving = false;
      let newFacingRight = facingRight;

      // Horizontal movement
      if (keys.has('a') || keys.has('arrowleft')) {
        newVelX = -MOVE_SPEED;
        moving = true;
        newFacingRight = false;
      } else if (keys.has('d') || keys.has('arrowright')) {
        newVelX = MOVE_SPEED;
        moving = true;
        newFacingRight = true;
      } else {
        newVelX = 0;
      }

      // Jumping
      if ((keys.has(' ') || keys.has('w') || keys.has('arrowup')) && isGrounded) {
        newVelY = -JUMP_FORCE;
      }

      // Apply gravity
      newVelY += GRAVITY;

      // Calculate new position
      const newX = position.x + newVelX;
      const newY = position.y + newVelY;

      // Check collisions
      const collision = checkCollisions(newX, newY);

      let finalY = newY;
      let finalVelY = newVelY;

      if (collision.onGround && newVelY >= 0) {
        finalY = collision.y;
        finalVelY = 0;
      }

      // Keep character in horizontal bounds (expand world)
      const finalX = Math.max(50, Math.min(1200, newX));

      // Update states
      setPosition({ x: finalX, y: finalY });
      setVelocity({ x: newVelX, y: finalVelY });
      setIsGrounded(collision.onGround);

      if (moving !== isMoving) {
        setIsMoving(moving);
      }

      if (newFacingRight !== facingRight) {
        setFacingRight(newFacingRight);
      }

      // Simple direct camera follow (no GSAP)
      const targetCameraX = Math.max(0, Math.min(400, finalX - 400));
      if (Math.abs(targetCameraX - cameraX) > 5) {
        // Only update if significant change
        setCameraX(targetCameraX);
      }
    };

    const intervalId = setInterval(gameLoop, 16); // ~60fps
    return () => clearInterval(intervalId);
  }, [position.x, position.y, velocity.x, velocity.y, isMoving, facingRight, isGrounded, cameraX]);

  // Update animation based on state
  useEffect(() => {
    if (
      animatedRef.current &&
      idleTextures.length > 0 &&
      runTextures.length > 0 &&
      jumpTextures.length > 0
    ) {
      let currentTextures;
      let animationSpeed;

      if (!isGrounded) {
        // Jump animation when in air
        currentTextures = jumpTextures;
        animationSpeed = 0.12;
      } else if (isMoving) {
        // Run animation when moving on ground
        currentTextures = runTextures;
        animationSpeed = 0.15;
      } else {
        // Idle animation when stationary on ground
        currentTextures = idleTextures;
        animationSpeed = 0.1;
      }

      animatedRef.current.textures = currentTextures;
      animatedRef.current.animationSpeed = animationSpeed;
      animatedRef.current.play();
    }
  }, [isMoving, isGrounded, idleTextures, runTextures, jumpTextures]);

  // Collision detection
  const checkCollisions = (newX: number, newY: number) => {
    const characterBounds = {
      x: newX - 24, // Half character width
      y: newY - 48, // Character height (anchored at bottom)
      width: 48,
      height: 48,
    };

    let onGround = false;
    let collisionY = newY;

    for (const platform of PLATFORMS) {
      // Check if character is above platform and falling/stationary
      if (
        characterBounds.x < platform.x + platform.width &&
        characterBounds.x + characterBounds.width > platform.x &&
        characterBounds.y + characterBounds.height <= platform.y + 5 && // Small tolerance
        characterBounds.y + characterBounds.height >= platform.y - 5
      ) {
        if (velocity.y >= 0) {
          // Only when falling or stationary
          onGround = true;
          collisionY = platform.y;
          break;
        }
      }
    }

    return { onGround, y: collisionY };
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-cyan-500 bg-black shadow-[0_0_20px_cyan]">
      <div className="absolute top-2 left-2 text-sm text-cyan-400">
        Controls: A/D or Arrows to move, Space/W/Up to jump
      </div>
      <div className="absolute top-6 left-2 text-xs text-cyan-400">
        Position: ({Math.round(position.x)}, {Math.round(position.y)}) | Grounded:{' '}
        {isGrounded ? 'Yes' : 'No'}
      </div>

      <Application width={appSize.width} height={appSize.height} backgroundColor={0x0f0f1a}>
        <pixiContainer ref={containerRef} x={-cameraX}>
          {/* Background */}
          <pixiGraphics draw={drawBackground} />

          {/* Platforms */}
          <pixiGraphics draw={drawPlatforms} />

          {/* Character */}
          {idleTextures.length > 0 &&
            runTextures.length > 0 &&
            jumpTextures.length > 0 &&
            !isLoading && (
              <pixiAnimatedSprite
                ref={animatedRef}
                textures={!isGrounded ? jumpTextures : isMoving ? runTextures : idleTextures}
                loop
                x={position.x}
                y={position.y}
                anchor={{ x: 0.5, y: 1.0 }}
                scale={{ x: facingRight ? 2 : -2, y: 2 }}
              />
            )}
        </pixiContainer>
      </Application>
    </div>
  );
};

export default Game;
