'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';

export default function LaserLightLayer() {
  const beamsRef = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      beamsRef.current.forEach((el, i) => {
        if (!el) {
          console.log(`Beam ${i} is null`);
          return;
        }

        const animations = [
          { rotation: '+=90', duration: 8 },
          { rotation: '-=75', duration: 5 },
          { rotation: '+=60', duration: 6 },
          { rotation: '-=45', duration: 7 },
        ];

        const anim = animations[i] || animations[0];

        gsap.to(el, {
          ...anim,
          transformOrigin: 'left center',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to(el, {
          opacity: 0.3,
          duration: 2 + i,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const setBeamRef = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      beamsRef.current[index] = el;
      console.log(`Set beam ref ${index}`);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Main laser beams - just 3 */}
      <div
        ref={el => setBeamRef(el, 0)}
        className="absolute h-[200vh] w-[3px] bg-gradient-to-t from-transparent via-cyan-400/50 to-cyan-500/80"
        style={{
          top: '-50%',
          left: '20%',
          transform: 'rotate(45deg)',
          transformOrigin: 'left center',
          boxShadow: '0 0 8px cyan',
        }}
      />

      <div
        ref={el => setBeamRef(el, 1)}
        className="absolute h-[200vh] w-[2px] bg-gradient-to-t from-transparent via-purple-400/60 to-purple-500/90"
        style={{
          top: '-30%',
          left: '70%',
          transform: 'rotate(30deg)',
          transformOrigin: 'left center',
          boxShadow: '0 0 6px purple',
        }}
      />

      <div
        ref={el => setBeamRef(el, 2)}
        className="absolute h-[180vh] w-[2px] bg-gradient-to-t from-transparent via-pink-400/40 to-pink-500/70"
        style={{
          top: '-20%',
          left: '45%',
          transform: 'rotate(60deg)',
          transformOrigin: 'left center',
          boxShadow: '0 0 5px #ff69b4',
        }}
      />

      <div
        ref={el => setBeamRef(el, 3)}
        className="absolute h-[180vh] w-[2px] bg-gradient-to-t from-transparent via-yellow-300/50 to-yellow-400/80"
        style={{
          top: '-30%',
          left: '10%',
          transform: 'rotate(75deg)',
          transformOrigin: 'left center',
          boxShadow: '0 0 6px #ffff66',
        }}
      />
    </div>
  );
}
