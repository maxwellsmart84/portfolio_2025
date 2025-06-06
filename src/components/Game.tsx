'use client';

import { Application, extend } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useCallback, useEffect, useRef, useState } from 'react';

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

// Coin positions
const COIN_POSITIONS = [
  { x: 150, y: GROUND_Y - 30 }, // Ground coin 1
  { x: 375, y: 170 }, // Platform 1 coin
  { x: 550, y: 120 }, // Platform 2 coin
  { x: 800, y: GROUND_Y - 30 }, // Ground coin 2
  { x: 1010, y: 150 }, // Platform 3 coin
  { x: 250, y: GROUND_Y - 60 }, // Floating coin
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
  const [coinTextures, setCoinTextures] = useState<PIXI.Texture[]>([]);
  const [appSize] = useState({ width: 5000, height: 300 });
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

  // Coin collection state
  const [collectedCoins, setCollectedCoins] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);

  // Game focus state
  const [gameStarted, setGameStarted] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const dialogueRef = useRef<HTMLDivElement>(null);

  // Dialogue system state
  const [isDialogueActive, setIsDialogueActive] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<string>('');
  const [dialogueTitle, setDialogueTitle] = useState<string>('');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  // Orientation detection state
  const [isPortrait, setIsPortrait] = useState(false);

  // Double tap detection for mobile jump
  const [lastTap, setLastTap] = useState(0);
  const DOUBLE_TAP_DELAY = 300; // milliseconds
  const touchKeysRef = useRef<Set<string>>(new Set());

  // Celebration state for end game
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [tennisBalls, setTennisBalls] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      velocityX: number;
      velocityY: number;
      rotation: number;
      rotationSpeed: number;
    }>
  >([]);

  // Check orientation and mobile device
  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobileDevice = width <= 768; // Tailwind md breakpoint
      const isPortraitMode = height > width;

      setIsPortrait(isPortraitMode && isMobileDevice);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Portfolio dialogue content for each coin
  const DIALOGUE_CONTENT = [
    {
      title: "Yo, I'm Bear 🐾",
      text: "I'm the wire-haired chaos goblin you see in the sprite. Max? He's my human. Code wizard, Warhammer nerd, and belly-scratch machine. 10/10 would follow again.",
    },
    {
      title: 'Code Alchemist',
      text: "Max has 10 years of experience building full-stack web apps with React, TypeScript, Node.js, GraphQL, and more. He doesn't just write code — he architects systems.",
    },
    {
      title: 'Bug Whisperer',
      text: "When things break (and they do), Max doesn't rage quit — he digs in, traces stack traces, and tames the chaos. Bonus points if it involves a gnarly data migration.",
    },
    {
      title: 'Not Just a Lone Wolf',
      text: "Max knows that great software isn't built in a vacuum. He's worked closely with designers, PMs, and founders — shipping products fast without the BS.",
    },
    {
      title: 'Forever Leveling Up',
      text: "From Solana smart contracts to real-time multiplayer apps — Max's side projects aren't just hobbies. They're how he keeps his blade sharp in an evolving tech world.",
    },
    {
      title: 'Thank you for playing!',
      text: 'I hope you enjoyed the game! If you want to reach out, you can find me on LinkedIn or email me: max@maxwell.dev.',
    },
  ];

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

    // Add windows to buildings
    buildings.forEach(building => {
      const windowWidth = 6;
      const windowHeight = 4;
      const windowSpacingX = 12;
      const windowSpacingY = 15;

      // Calculate how many windows can fit
      const windowsPerRow = Math.floor((building.width - 10) / windowSpacingX);
      const windowRows = Math.floor((building.height - 20) / windowSpacingY);

      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowsPerRow; col++) {
          // Randomly light some windows (about 60% chance)
          if (Math.random() > 0.4) {
            const windowX = building.x + 5 + col * windowSpacingX;
            const windowY = building.y + 10 + row * windowSpacingY;

            graphics.rect(windowX, windowY, windowWidth, windowHeight);
            graphics.fill({ color: 0xffff88 }); // Yellow window light
          }
        }
      }
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
        const sheet = await PIXI.Assets.load('/assets/bear_2.json');
        const coinSheet = await PIXI.Assets.load('/assets/coin.json');
        // Manually define textures using named textures from the sheet
        const run = [
          sheet.textures['bear_2 #run 2.png'],
          sheet.textures['bear_2 #run 1.png'],
          sheet.textures['bear_2 #run 0.png'],
        ];
        const jump = [sheet.textures['bear_2 #jump.png']];
        const idle = [sheet.textures['bear_2 #idle.png']];

        setRunTextures(run);
        setIdleTextures(idle);
        setJumpTextures(jump);
        // Fix coin textures - convert to array properly
        const coinTextureArray = Object.values(coinSheet.textures) as PIXI.Texture[];
        setCoinTextures(coinTextureArray);
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
    const handleKeyDown = (event: Event) => {
      const keyEvent = event as KeyboardEvent;
      const key = keyEvent.key.toLowerCase();

      // Prevent default behavior for game control keys
      if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)
      ) {
        keyEvent.preventDefault();
      }

      // Don't process movement keys during dialogue
      if (!isDialogueActive) {
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (event: Event) => {
      const keyEvent = event as KeyboardEvent;
      const key = keyEvent.key.toLowerCase();
      // Prevent default behavior for game control keys
      if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)
      ) {
        keyEvent.preventDefault();
      }
      keysPressed.current.delete(key);
    };

    // Attach to game container if started, otherwise to window
    const target = gameStarted && gameContainerRef.current ? gameContainerRef.current : window;
    target.addEventListener('keydown', handleKeyDown);
    target.addEventListener('keyup', handleKeyUp);

    return () => {
      target.removeEventListener('keydown', handleKeyDown);
      target.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted]);

  // Handle game start/focus
  const handleGameStart = () => {
    setGameStarted(true);
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  };

  // Game loop for movement and physics
  useEffect(() => {
    // Don't run game loop during dialogue
    if (isDialogueActive) {
      // Clear movement keys but preserve physics state (velocity, position, grounded status)
      keysPressed.current.clear();
      return;
    }

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
      const collision = checkCollisions(newX, newY, newVelY);

      let finalY = newY;
      let finalVelY = newVelY;

      if (collision.onGround && newVelY >= 0) {
        finalY = collision.y;
        finalVelY = 0;
      }

      // Keep character in horizontal bounds (expand world)
      const finalX = Math.max(50, Math.min(1200, newX));

      // Check if character fell off the screen and reset to starting position
      if (finalY > 400) {
        setPosition({ x: 100, y: GROUND_Y }); // Reset to starting position
        setVelocity({ x: 0, y: 0 }); // Reset velocity
        setIsGrounded(true);
        return; // Exit early to prevent further updates this frame
      }

      // Check coin collection (check both old and new position to prevent skipping)
      checkCoinCollection(position.x, position.y); // Check current position
      checkCoinCollection(finalX, finalY); // Check new position

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
  }, [
    position.x,
    position.y,
    velocity.x,
    velocity.y,
    isMoving,
    facingRight,
    isGrounded,
    cameraX,
    isDialogueActive,
  ]);

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
  const checkCollisions = (newX: number, newY: number, currentVelY: number) => {
    // Character is anchored at bottom, so newY is the bottom of the character
    const characterLeft = newX - 24; // Half character width
    const characterRight = newX + 24;
    const characterBottom = newY;

    let onGround = false;
    let collisionY = newY;

    for (const platform of PLATFORMS) {
      // Check horizontal overlap
      const horizontalOverlap =
        characterLeft < platform.x + platform.width && characterRight > platform.x;

      // Check if character is landing on top of platform
      if (horizontalOverlap && currentVelY >= 0) {
        // Character bottom should be near platform top
        if (characterBottom >= platform.y && characterBottom <= platform.y + 15) {
          onGround = true;
          collisionY = platform.y;
          break;
        }
      }
    }

    return { onGround, y: collisionY };
  };

  // Coin collection checking
  const checkCoinCollection = (x: number, y: number) => {
    COIN_POSITIONS.forEach((coin, index) => {
      // Skip if already collected
      if (collectedCoins.has(index)) return;

      // More generous collision detection
      const distance = Math.sqrt((x - coin.x) ** 2 + (y - coin.y) ** 2);
      if (distance < 35) {
        // Increased from 20 to 35 for easier collection
        setCollectedCoins(prevCoins => {
          const newCoins = new Set(prevCoins);
          if (!newCoins.has(index)) {
            newCoins.add(index);
            setScore(prevScore => prevScore + 100);

            // Trigger dialogue for all coins with special cases for first and last
            const totalCoinsCollected = collectedCoins.size + 1; // +1 because we're about to add this coin

            console.log(
              `Collecting coin ${index}, total collected will be: ${totalCoinsCollected}`
            );

            if (totalCoinsCollected === 1) {
              // First coin collected - static introduction
              setDialogueTitle(DIALOGUE_CONTENT[0].title);
              setCurrentDialogue(DIALOGUE_CONTENT[0].text);
              setIsDialogueActive(true);
            } else if (totalCoinsCollected === 6) {
              // Last coin collected - use dialogue content
              setDialogueTitle(DIALOGUE_CONTENT[5].title);
              setCurrentDialogue(DIALOGUE_CONTENT[5].text);
              setIsDialogueActive(true);
            } else if (DIALOGUE_CONTENT[totalCoinsCollected - 1]) {
              // Middle coins (2-5) use content from array
              setDialogueTitle(DIALOGUE_CONTENT[totalCoinsCollected - 1].title);
              setCurrentDialogue(DIALOGUE_CONTENT[totalCoinsCollected - 1].text);
              setIsDialogueActive(true);
            }
          }
          return newCoins;
        });
      }
    });
  };

  // Typewriter effect for dialogue
  useEffect(() => {
    if (!isDialogueActive || !currentDialogue) return;

    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    const typingSpeed = 30; // milliseconds per character

    const typeInterval = setInterval(() => {
      if (currentIndex < currentDialogue.length) {
        setDisplayedText(currentDialogue.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [currentDialogue, isDialogueActive]);

  // Auto-focus dialogue when it appears
  useEffect(() => {
    if (isDialogueActive && dialogueRef.current) {
      dialogueRef.current.focus();
    }
  }, [isDialogueActive]);

  // Clear key states when dialogue ends to prevent stuck movement
  useEffect(() => {
    if (!isDialogueActive) {
      keysPressed.current.clear();
      // Return focus to game container when dialogue closes
      if (gameContainerRef.current) {
        gameContainerRef.current.focus();
      }

      // Check if we just finished the final dialogue (all coins collected)
      if (collectedCoins.size === 6) {
        setIsCelebrating(true);
        // Start tennis ball rain!
        const ballCount = 60; // Increased from 20 to 60
        const newBalls = Array.from({ length: ballCount }, (_, i) => ({
          id: i,
          x: Math.random() * appSize.width,
          y: -50 - Math.random() * 200, // Start above screen
          velocityX: (Math.random() - 0.5) * 8, // Random horizontal velocity
          velocityY: Math.random() * 3 + 2, // Downward velocity
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
        }));
        setTennisBalls(newBalls);
      }
    }
  }, [isDialogueActive, collectedCoins.size, appSize.width]);

  // Tennis ball physics animation
  useEffect(() => {
    if (!isCelebrating) return;

    // Helper function to check ball collision with platforms
    const checkBallPlatformCollision = (ball: {
      id: number;
      x: number;
      y: number;
      velocityX: number;
      velocityY: number;
      rotation: number;
      rotationSpeed: number;
    }) => {
      const ballRadius = 8; // Tennis ball radius
      const newBall = { ...ball };

      for (const platform of PLATFORMS) {
        // Check if ball is near the platform
        const ballLeft = ball.x - ballRadius;
        const ballRight = ball.x + ballRadius;
        const ballTop = ball.y - ballRadius;
        const ballBottom = ball.y + ballRadius;

        // Check horizontal overlap
        if (ballRight > platform.x && ballLeft < platform.x + platform.width) {
          // Check if ball is landing on top of platform
          if (
            ball.velocityY > 0 && // Ball is moving downward
            ballBottom >= platform.y &&
            ballBottom <= platform.y + platform.height + 5 && // Small buffer for collision detection
            ballTop < platform.y
          ) {
            // Bounce off top of platform
            newBall.y = platform.y - ballRadius;
            newBall.velocityY = -Math.abs(ball.velocityY) * 0.7; // Bounce with energy loss
            newBall.rotationSpeed = newBall.rotationSpeed * 0.8;
            break;
          }
          // Check if ball hits bottom of platform
          else if (
            ball.velocityY < 0 && // Ball is moving upward
            ballTop <= platform.y + platform.height &&
            ballTop >= platform.y - 5 &&
            ballBottom > platform.y + platform.height
          ) {
            // Bounce off bottom of platform
            newBall.y = platform.y + platform.height + ballRadius;
            newBall.velocityY = Math.abs(ball.velocityY) * 0.7;
            newBall.rotationSpeed = newBall.rotationSpeed * 0.8;
            break;
          }
        }

        // Check vertical overlap for side collisions
        if (ballBottom > platform.y && ballTop < platform.y + platform.height) {
          // Check if ball hits left side of platform
          if (
            ball.velocityX > 0 && // Ball is moving right
            ballRight >= platform.x &&
            ballRight <= platform.x + 5 &&
            ballLeft < platform.x
          ) {
            newBall.x = platform.x - ballRadius;
            newBall.velocityX = -Math.abs(ball.velocityX) * 0.8;
            break;
          }
          // Check if ball hits right side of platform
          else if (
            ball.velocityX < 0 && // Ball is moving left
            ballLeft <= platform.x + platform.width &&
            ballLeft >= platform.x + platform.width - 5 &&
            ballRight > platform.x + platform.width
          ) {
            newBall.x = platform.x + platform.width + ballRadius;
            newBall.velocityX = Math.abs(ball.velocityX) * 0.8;
            break;
          }
        }
      }

      return newBall;
    };

    const animateBalls = () => {
      setTennisBalls(
        prevBalls =>
          prevBalls
            .map(ball => {
              // Apply basic physics first
              let newBall = {
                ...ball,
                x: ball.x + ball.velocityX,
                y: ball.y + ball.velocityY,
                velocityY: ball.velocityY + 0.2, // Gravity
                velocityX: ball.velocityX * 0.999, // Air resistance
                rotation: ball.rotation + ball.rotationSpeed,
              };

              // Check platform collisions
              newBall = checkBallPlatformCollision(newBall);

              // Bounce off sides
              if (newBall.x <= 8 || newBall.x >= appSize.width - 8) {
                newBall.velocityX = -newBall.velocityX * 0.8;
                newBall.x = Math.max(8, Math.min(appSize.width - 8, newBall.x));
              }

              // Bounce off ground (y = 280 is ground level)
              if (newBall.y >= 280 - 8) {
                newBall.velocityY = -Math.abs(newBall.velocityY) * 0.7;
                newBall.y = 280 - 8;
                newBall.rotationSpeed = newBall.rotationSpeed * 0.8;
              }

              return newBall;
            })
            .filter(ball => ball.y < 400) // Remove balls that fall too far
      );
    };

    const interval = setInterval(animateBalls, 16); // ~60fps
    return () => clearInterval(interval);
  }, [isCelebrating, appSize.width]);

  // Function to reset game to beginning
  const resetGame = () => {
    // Reset character position and physics
    setPosition({ x: 100, y: GROUND_Y });
    setVelocity({ x: 0, y: 0 });
    setIsMoving(false);
    setFacingRight(true);
    setIsGrounded(true);

    // Reset camera
    setCameraX(0);

    // Reset coin collection and score
    setCollectedCoins(new Set());
    setScore(0);

    // Reset dialogue state
    setIsDialogueActive(false);
    setCurrentDialogue('');
    setDialogueTitle('');
    setDisplayedText('');
    setIsTyping(false);

    // Reset celebration state
    setIsCelebrating(false);
    setTennisBalls([]);

    // Clear any pressed keys
    keysPressed.current.clear();

    // Return focus to game
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  };

  return (
    <div
      ref={gameContainerRef}
      className="relative w-full overflow-hidden rounded-xl border border-cyan-500 bg-black shadow-[0_0_20px_cyan] focus:outline-none"
      tabIndex={0}
      onClick={handleGameStart}
      onTouchStart={e => {
        e.preventDefault();
        if (isDialogueActive) {
          // Handle dialogue on touch
          if (isTyping) {
            setDisplayedText(currentDialogue);
            setIsTyping(false);
          } else {
            setIsDialogueActive(false);
          }
          return;
        }

        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const isLeftHalf = touchX < rect.width / 2;

        const now = Date.now();
        const timeDiff = now - lastTap;

        if (timeDiff < DOUBLE_TAP_DELAY && timeDiff > 0) {
          // Double tap detected - jump AND set direction!
          if (isGrounded) {
            keysPressed.current.add(' ');
            // Remove jump key after a brief delay to prevent stuck jumping
            setTimeout(() => {
              keysPressed.current.delete(' ');
            }, 50);
          }

          // Also set movement direction for air control
          touchKeysRef.current.clear();
          touchKeysRef.current.add(isLeftHalf ? 'a' : 'd');
          keysPressed.current.delete('a');
          keysPressed.current.delete('d');
          keysPressed.current.add(isLeftHalf ? 'a' : 'd');

          setLastTap(0); // Reset to prevent triple tap
        } else {
          // Single tap - move (works both on ground and in air)
          touchKeysRef.current.clear();
          touchKeysRef.current.add(isLeftHalf ? 'a' : 'd');
          keysPressed.current.delete('a');
          keysPressed.current.delete('d');
          keysPressed.current.add(isLeftHalf ? 'a' : 'd');
          setLastTap(now);
        }
      }}
      onTouchEnd={e => {
        e.preventDefault();
        if (!isDialogueActive) {
          // Only clear keys that were set by touch
          setTimeout(() => {
            touchKeysRef.current.forEach(key => {
              keysPressed.current.delete(key);
            });
            touchKeysRef.current.clear();
          }, 100);
          // Clear jump key immediately (always safe since it's momentary)
          keysPressed.current.delete(' ');
        }
      }}
    >
      {/* Rotate to play message for mobile portrait */}
      {isPortrait && (
        <div className="bg-opacity-90 absolute inset-0 z-30 flex flex-col items-center justify-center bg-black">
          <div className="px-6 text-center">
            <div className="font-arcade mb-6 animate-pulse text-2xl text-cyan-400">📱➡️📱</div>
            <div className="font-arcade mb-4 text-lg text-cyan-400">ROTATE TO PLAY</div>
            <div className="font-arcade max-w-xs text-sm text-cyan-300">
              This game is best experienced in landscape mode
            </div>
          </div>
        </div>
      )}

      {!gameStarted && !isPortrait && (
        <div className="bg-opacity-75 absolute inset-0 z-10 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="font-arcade mb-4 animate-pulse text-2xl text-cyan-400">
              🎮 CLICK/TOUCH TO START GAME 🎮
            </div>
            <div className="font-arcade text-sm text-cyan-300">LEARN MORE ABOUT MAX</div>
          </div>
        </div>
      )}

      <div className="font-arcade absolute top-2 left-2 max-w-xs text-xs text-cyan-400 md:max-w-none md:text-sm">
        <div className="hidden md:block">Controls: A/D or Arrows to move, Space/W/Up to jump</div>
        <div className="md:hidden">Tap left/right to move, double-tap to jump</div>
      </div>
      {/* <div className="font-arcade absolute top-6 left-2 text-xs text-cyan-400">
        Position: ({Math.round(position.x)}, {Math.round(position.y)}) | Grounded:{' '}
        {isGrounded ? 'Yes' : 'No'}
      </div> */}
      <div className="font-arcade absolute top-12 left-2 text-xs text-cyan-400">
        Score: {score} | Coins: {collectedCoins.size}/{COIN_POSITIONS.length}
      </div>

      {/* Play Again Button - appears during celebration */}
      {isCelebrating && (
        <button
          onClick={resetGame}
          className="font-arcade bg-opacity-80 absolute top-2 right-2 z-10 rounded border-2 border-cyan-400 bg-black px-4 py-2 text-sm text-cyan-400 transition-all hover:bg-cyan-400 hover:text-black focus:ring-2 focus:ring-cyan-400 focus:outline-none"
        >
          🎮 PLAY AGAIN
        </button>
      )}

      {/* Final Fantasy Style Dialogue Box */}
      {isDialogueActive && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          ref={dialogueRef}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key.toLowerCase() === 'a') {
              e.preventDefault();
              if (isTyping) {
                // Skip typing animation
                setDisplayedText(currentDialogue);
                setIsTyping(false);
              } else {
                // Close dialogue
                setIsDialogueActive(false);
              }
            }
          }}
          style={{ outline: 'none' }}
        >
          <div className="relative mx-4 max-w-2xl rounded-lg border-4 border-gray-300 bg-blue-800 p-6">
            {/* Outer border effect */}
            <div className="absolute inset-0 -m-1 rounded-lg border-2 border-blue-600 bg-blue-900"></div>

            {/* Content */}
            <div className="relative flex gap-4">
              {/* Character Portrait */}
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded border-2 border-gray-300 bg-blue-700">
                <img
                  src="/assets/bear_detail_1.png"
                  alt="Bear"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <div className="font-arcade mb-2 text-sm text-white">{dialogueTitle}</div>
                <div className="font-arcade text-xs leading-relaxed text-white">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </div>
                <div className="font-arcade mt-4 text-right text-xs text-gray-300">
                  {isTyping ? 'Press A to skip...' : 'Press A to continue...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Application width={appSize.width} height={appSize.height} backgroundColor={0x0f0f1a}>
        <pixiContainer ref={containerRef} x={-cameraX}>
          {/* Background */}
          <pixiGraphics draw={drawBackground} />

          {/* Platforms */}
          <pixiGraphics draw={drawPlatforms} />

          {/* Coins */}
          {coinTextures.length > 0 &&
            COIN_POSITIONS.map((coin, index) => {
              if (!collectedCoins.has(index)) {
                return (
                  <pixiAnimatedSprite
                    key={`coin-${index}`}
                    textures={coinTextures}
                    loop={true}
                    x={coin.x}
                    y={coin.y}
                    anchor={{ x: 0.5, y: 0.5 }}
                    scale={{ x: 1.5, y: 1.5 }}
                    animationSpeed={0.2}
                    ref={(sprite: PIXI.AnimatedSprite | null) => {
                      if (sprite && !sprite.playing) {
                        sprite.play();
                      }
                    }}
                  />
                );
              }
              return null;
            })}

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

          {/* Tennis ball celebration rain */}
          {isCelebrating &&
            tennisBalls.map(ball => (
              <pixiGraphics
                key={`tennis-ball-${ball.id}`}
                x={ball.x}
                y={ball.y}
                rotation={ball.rotation}
                draw={(graphics: PIXI.Graphics) => {
                  graphics.clear();
                  // Tennis ball body (yellow-green)
                  graphics.circle(0, 0, 8);
                  graphics.fill({ color: 0x9acd32 });

                  // Tennis ball lines (white)
                  graphics.moveTo(-8, 0);
                  graphics.arcTo(0, -4, 8, 0, 4);
                  graphics.arcTo(0, 4, -8, 0, 4);
                  graphics.stroke({ color: 0xffffff, width: 1 });

                  // Second curve
                  graphics.moveTo(-8, 0);
                  graphics.arcTo(0, 4, 8, 0, 4);
                  graphics.arcTo(0, -4, -8, 0, 4);
                  graphics.stroke({ color: 0xffffff, width: 1 });
                }}
              />
            ))}
        </pixiContainer>
      </Application>
    </div>
  );
};

export default Game;
