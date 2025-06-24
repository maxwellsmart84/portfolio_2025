'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

type Story = {
  by: string;
  descendants: number;
  id: number;
  kids: number[];
  score: number;
  time: number;
  title: string;
  type: string;
  url: string;
  text?: string;
};

const formatDate = (unixTimestamp: number) => {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleDateString();
};

const NewsTicker: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchTopStories = async () => {
      try {
        const hackerNews = await fetch(
          'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty'
        );
        const storyIds: number[] = await hackerNews.json();

        const topStories = await Promise.all(
          storyIds
            .slice(0, 20) // Get more stories for scrolling
            .map(id =>
              fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`).then(
                res => res.json()
              )
            )
        );
        setStories(topStories.filter(story => story && story.title));
      } catch (error) {
        console.error(error);
      }
    };

    fetchTopStories();
  }, []);

  if (stories.length === 0) return null;

  return (
    <div className="w-full overflow-hidden border-y-2 border-purple-300 bg-black py-2 drop-shadow-[0_0_10px_purple]">
      <motion.div
        className="flex whitespace-nowrap will-change-transform"
        animate={{ x: ['0%', '-100%'] }}
        transition={{
          duration: isMobile ? 85 : 175,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ display: 'inline-flex' }}
      >
        {[...stories, ...stories].map((story, index) => (
          <div
            key={`${story.id}-${index}`}
            className="flex items-center whitespace-nowrap"
            style={{ width: 'max-content' }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-8 text-cyan-400 transition-colors hover:text-cyan-300"
                  >
                    📰 {story.title}
                  </a>
                </TooltipTrigger>
                <TooltipContent className="max-w-80 border border-cyan-500 bg-gray-900 text-sm text-cyan-400">
                  <div className="text-xs text-purple-300">
                    Score: {story.score} | {formatDate(story.time)}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="mx-4 text-purple-400">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default NewsTicker;
