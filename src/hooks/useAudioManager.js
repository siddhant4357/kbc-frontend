import { useState, useEffect } from 'react';

export const useAudioManager = (audioFiles) => {
  const [audioElements, setAudioElements] = useState({});

  useEffect(() => {
    const elements = {};
    Object.entries(audioFiles).forEach(([key, file]) => {
      elements[key] = new Audio(file);
    });
    setAudioElements(elements);

    return () => {
      Object.values(elements).forEach(audio => {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  const play = async (key, options = {}) => {
    try {
      await stopAll();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const audio = audioElements[key];
      if (!audio) return;

      audio.currentTime = 0;
      audio.loop = !!options.loop;
      await audio.play();
    } catch (error) {
      console.error(`Error playing ${key}:`, error);
    }
  };

  const stop = async (key) => {
    try {
      if (audioElements[key] && !audioElements[key].paused) {
        await audioElements[key].pause();
        audioElements[key].currentTime = 0;
      }
    } catch (error) {
      console.error(`Error stopping ${key}:`, error);
    }
  };

  const stopAll = async () => {
    await Promise.all(Object.keys(audioElements).map(stop));
  };

  return { play, stop, stopAll };
};