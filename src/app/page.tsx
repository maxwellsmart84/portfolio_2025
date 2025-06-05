'use client';

import Game from '@/components/Game';
import LaserLightLayer from '@/components/LaserLight';
import NewsTicker from '@/components/NewsTicker';
import PriceChart from '@/components/PriceChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  // const handleClick = () => {
  //   console.log("Button clicked");
  // };

  const COMPANY_LOGOS = [
    { name: 'planelogix', src: '/assets/planelogix.svg', link: 'https://planelogix.com' },
    { name: 'rhinogram', src: '/assets/rhinogram.svg', link: 'https://rhinogram.com' },
    { name: 'roobet', src: '/assets/roobet.svg', link: 'https://roobet.com' },
    { name: 'vw', src: '/assets/vw.svg', link: 'https://vw.com' },
    { name: 'audi', src: '/assets/audi.svg', link: 'https://audi.com' },
    { name: 'charleston hacks', src: '/assets/chs_hacks.svg', link: 'https://charlestonhacks.com' },
    { name: 'microsoft', src: '/assets/microsoft.svg', link: 'https://microsoft.com' },
  ];

  return (
    <main className="relative min-h-screen scroll-smooth text-white">
      <LaserLightLayer />
      <div className="relative z-10">
        <section id="hero" className="flex flex-col items-center justify-center px-4 text-center">
          <div className="w-full py-8">
            <motion.div
              animate={{
                opacity: [1, 0, 1, 0, 1, 0, 1, 1, 1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
              }}
              className="font-arcade flex items-center justify-center gap-2 text-xl text-purple-300 drop-shadow-[0_0_10px_purple]"
            >
              HACKER NEWS
            </motion.div>

            <NewsTicker />
          </div>
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
              Maxwell Krause
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
            <Button
              className="bg-cyan-500 shadow-[0_0_10px_cyan] hover:bg-cyan-400"
              onClick={() => window.open('https://github.com/maxwellsmart84', '_blank')}
            >
              View Projects
            </Button>
            <Button
              onClick={() => window.open('mailto:maxwell.l.krause@gmail.com', '_blank')}
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-800"
            >
              Contact
            </Button>
          </div>
        </section>

        <section id="game" className="px-4 py-12 text-center">
          <div className="mx-auto flex w-2/3 justify-center">
            <Game />
          </div>
        </section>
        {/* <section id="synth" className="px-4 py-12 text-center">
          <SynthControls />
        </section> */}

        <section id="community" className="px-4 py-12 text-center">
          <h2 className="mb-6 text-3xl text-cyan-400">Community & Mentorship</h2>
          <div className="mx-auto flex w-2/3 flex-col gap-8">
            <Card className="border border-cyan-500 bg-gray-900 shadow-[0_0_15px_cyan] transition-all hover:scale-105">
              <CardContent>
                <div className="mx-auto flex items-center justify-center gap-4">
                  <a
                    href="https://www.tealsk12.org/"
                    className="flex items-center gap-4 text-cyan-300 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h3 className="text-xl font-bold text-purple-300">Microsoft TEALS Program</h3>
                  </a>
                </div>

                <p className="mx-auto max-w-xl text-purple-200">
                  I spent 2 years volunteering at Charleston Charter Math and Science helping high
                  school students learn computer science with Python. It was one of the most
                  rewarding parts of my journey — and reminded me how much I love demystifying tech
                  for others.
                </p>
                <div className="flex justify-center gap-4">
                  <a
                    href="https://charlestonmathscience.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image src="/assets/ccms.png" alt="CCMS" width={128} height={128} />
                  </a>
                  <a
                    href="https://www.tealsk12.org/"
                    className="flex items-center gap-4 text-cyan-300 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="assets/microsoft.svg"
                      alt="Microsoft"
                      width={128}
                      height={128}
                      className="text-purple-300"
                    />
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-cyan-500 bg-gray-900 shadow-[0_0_15px_cyan] transition-all hover:scale-105">
              <CardContent>
                <iframe
                  className="h-48 w-full rounded md:h-56"
                  src="https://www.youtube.com/embed/x4Yqf4iGZrc?si=5GjJ9XMK-s6xhBK6"
                  title="AI Video Contest Winner"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
                <h3 className="mt-4 mb-2 text-xl font-bold text-purple-300">
                  <a
                    href="https://www.linkedin.com/posts/maxwell-krause_what-activity-7324048826065956864-DbBl?utm_source=share&utm_medium=member_desktop&rcm=ACoAAASdmFwBIsETXVezGV4dyzRSg-2erWFJiLA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-300 hover:underline"
                  >
                    Charleston Hacks 2025 AI Video Contest Winner
                  </a>
                </h3>
                <p className="text-purple-200">
                  I won people&apos;s choice award place in an AI video creation contest where I
                  animated my miniatures.
                </p>
                <div className="flex justify-center pt-4">
                  <a href="https://charlestonhacks.com/" target="_blank" rel="noopener noreferrer">
                    <Image
                      src="/assets/chs_hacks.svg"
                      alt="Charleston Hacks"
                      width={128}
                      height={128}
                      className="text-purple-300"
                    />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="projects" className="px-4 py-12 text-center">
          <h2 className="mb-10 text-3xl text-cyan-400">Projects</h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border border-cyan-500 bg-gray-900 shadow-[0_0_15px_cyan] transition-all hover:scale-105">
              <CardContent
                onClick={() => window.open('https://hackathon-chs.vercel.app/', '_blank')}
                className="cursor-pointer p-6"
              >
                <Image
                  src="/assets/chs_hackathon.png"
                  alt="Medtech Hackathon"
                  width={512}
                  height={288}
                  className="mb-4 rounded border border-purple-400 shadow-lg"
                />
                <h3 className="mb-2 text-xl font-bold text-purple-300">Commission Marketplace</h3>
                <p className="text-purple-200">
                  A hackathon project for Charleston Hacks 2025. We are building a web app that
                  allows medtech companies to find and hire companies to assist with their projects.
                </p>
                <ul className="mt-2 list-disc pl-4 text-left text-sm text-purple-200">
                  <li>Built with Next.js, Clerk, and Tailwind</li>
                  <li>REST with MCP to deliver a API queryable by AI</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-cyan-500 bg-gray-900 shadow-[0_0_15px_cyan] transition-all hover:scale-105">
              <CardContent className="p-6">
                <Image
                  src="/assets/challenger-app.png"
                  alt="Challenge App"
                  width={512}
                  height={288}
                  className="mb-4 rounded border border-purple-400 shadow-lg"
                />
                <h3 className="mb-2 text-xl font-bold text-purple-300">Challenge App</h3>
                <p className="text-purple-200">
                  A proximity-based mobile-friendly web app to find and play 1v1 tabletop matches.
                  Designed for in-store pickup games and local leagues.
                </p>
                <ul className="mt-2 list-disc pl-4 text-left text-sm text-purple-200">
                  <li>Real-time location & matchmaking with Firebase</li>
                  <li>PlanetScale + Drizzle ORM schema for user inventory</li>
                  <li>Push notifications and real-time updates with Pusher</li>
                </ul>
                <p className="mt-2 text-sm text-cyan-400">Demo coming soon</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="tech" className="px-4 py-12 text-center">
          <h2 className="mb-6 text-3xl text-cyan-400">Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Next.js',
              'Vue',
              'React',
              'Node.js',
              'TypeScript',
              'GraphQL',
              'Tailwind',
              'Firebase',
              'Web3',
              'Rust',
              'MongoDB',
              'MySQL',
              'PostgreSQL',
              'Redis',
              'Docker',
              'AWS',
              'GCP',
            ].map(tech => (
              <Badge
                key={tech}
                className="border border-purple-400 bg-purple-900 text-purple-200 shadow-[0_0_10px_purple]"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </section>
        <section id="trusted-by" className="px-4 py-12 text-center">
          <h2 className="mb-6 text-3xl text-cyan-400">Trusted By</h2>
          <div className="mx-auto flex flex-wrap items-center justify-center gap-12">
            {COMPANY_LOGOS.map(company => (
              <a key={company.name} href={company.link} target="_blank" rel="noopener noreferrer">
                <Image
                  key={company.name}
                  src={company.src}
                  alt={`${company.name} logo`}
                  className="h-32 w-32 object-contain opacity-60 brightness-0 invert transition-all hover:opacity-100"
                  width={128}
                  height={128}
                />
              </a>
            ))}
          </div>
        </section>

        <section id="contact" className="px-4 py-12 text-center">
          <h2 className="mb-6 text-3xl text-cyan-400">Contact</h2>
          <p className="mb-4 text-purple-200">Got a project or just want to talk Warhammer?</p>
          <a href="mailto:max@example.com" className="text-cyan-300 underline hover:text-cyan-100">
            maxwell.l.krause@gmail.com
          </a>
          <div className="flex justify-center gap-4 pt-2">
            <a href="https://github.com/maxwellkrause" target="_blank" rel="noopener noreferrer">
              <Image src="/assets/github.svg" alt="Github" width={32} height={32} />
            </a>
            <a
              href="https://www.linkedin.com/in/maxwell-krause/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="brightness-0 invert"
                src="/assets/linkedin.svg"
                alt="Linkedin"
                width={32}
                height={32}
              />
            </a>
          </div>
        </section>

        <footer className="py-10 text-center text-sm text-purple-600">
          © 2025 Max Krause. Neon-coded in Charleston.
        </footer>
      </div>
    </main>
  );
}
