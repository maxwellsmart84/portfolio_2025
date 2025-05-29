'use client';

import Game from '@/components/Game';
import PriceChart from '@/components/PriceChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function Home() {
  // const handleClick = () => {
  //   console.log("Button clicked");
  // };

  return (
    <main className="min-h-screen scroll-smooth bg-black text-white">
      <section
        id="hero"
        className="flex h-screen flex-col items-center justify-center px-4 pt-24 text-center"
      >
        <div className="flex w-full flex-col justify-evenly md:flex-row">
          <div key="btcusdt">
            <PriceChart ticker="btcusdt" />
          </div>
          <div key="ethusdt">
            <PriceChart ticker="ethusdt" />
          </div>
          <div key="solusdt">
            <PriceChart ticker="solusdt" />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          //  className="bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_10px_cyan] text-white font-bold py-2 px-4 rounded"
        >
          <h1 className="mt-14 mb-14 rounded-md border-2 border-purple-400 p-8 text-5xl font-bold text-cyan-400 outline-4 outline-offset-[1rem] outline-purple-400 drop-shadow-[0_0_15px_cyan] md:text-7xl">
            Max Krause
          </h1>
        </motion.button>
        <div className="mb-6 max-w-xl text-xl text-purple-300 drop-shadow-[0_0_10px_purple] md:text-2xl">
          Full-stack dev focused on scale, speed, and{' '}
          <motion.span
            className="text-xl font-bold text-purple-300 drop-shadow-[0_0_10px_purple] md:text-2xl"
            animate={{
              textShadow: ['0 0 10px #0ff', '0 0 20px #0ff', '0 0 10px #0ff'],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            synthwave
          </motion.span>
        </div>

        <div className="flex gap-4">
          <Button className="bg-cyan-500 shadow-[0_0_10px_cyan] hover:bg-cyan-400">
            View Projects
          </Button>
          <Button
            variant="outline"
            className="border-purple-400 text-purple-400 hover:bg-purple-800"
          >
            Contact
          </Button>
        </div>
      </section>

      <section id="about" className="px-4 py-24 text-center">
        <h2 className="mb-4 text-3xl text-cyan-400">About Me</h2>
        <p className="mx-auto max-w-2xl text-purple-200">
          I specialize in full-stack web apps, blending great UX with smart architecture. I've built
          everything from NFT platforms to Warhammer tools.
        </p>
      </section>

      <section id="projects" className="px-4 py-24 text-center">
        <h2 className="mb-10 text-3xl text-cyan-400">Projects</h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border border-cyan-500 bg-gray-900 shadow-[0_0_15px_cyan] transition-all hover:scale-105">
            <CardContent
              onClick={() => window.open('https://commission-marketplace.vercel.app', '_blank')}
              className="p-6"
            >
              <h3 className="mb-2 text-xl font-bold text-purple-300">Commission Marketplace</h3>
              <p className="text-purple-200">
                A platform to hire mini painters, built with Clerk, Open Federation, and Next.js.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-cyan-500 bg-gray-900 shadow-[0_0_15px_cyan] transition-all hover:scale-105">
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-bold text-purple-300">Challenge App</h3>
              <p className="text-purple-200">
                Proximity-based app for 1v1 matchups. Firebase + PlanetScale + Tailwind.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="game" className="px-4 py-24 text-center">
        <div className="flex w-full justify-center">
          <Game />
        </div>
      </section>

      <section id="tech" className="px-4 py-24 text-center">
        <h2 className="mb-6 text-3xl text-cyan-400">Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {['Next.js', 'TypeScript', 'GraphQL', 'Tailwind', 'Firebase', 'Solana'].map(tech => (
            <Badge
              key={tech}
              className="border border-purple-400 bg-purple-900 text-purple-200 shadow-[0_0_10px_purple]"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      <section id="contact" className="px-4 py-24 text-center">
        <h2 className="mb-6 text-3xl text-cyan-400">Contact</h2>
        <p className="mb-4 text-purple-200">Got a project or just want to talk Warhammer?</p>
        <a href="mailto:max@example.com" className="text-cyan-300 underline hover:text-cyan-100">
          maxwell.l.krause@gmail.com
        </a>
      </section>

      <footer className="py-10 text-center text-sm text-purple-600">
        © 2025 Max Krause. Neon-coded in Charleston.
      </footer>
    </main>
  );
}
