export const loadAudio = (audioPath, volume = 0.5) => {
  const audio = new Audio(audioPath);
  audio.volume = volume;
  audio.preload = 'auto';
  return audio;
};

export const playWithFallback = async (audio) => {
  try {
    await audio.play();
  } catch (error) {
    console.error('Audio playback failed:', error);
  }
};

// Add additional utility functions
export const stopAudio = async (audio) => {
  try {
    if (!audio.paused) {
      await audio.pause();
      audio.currentTime = 0;
    }
  } catch (error) {
    console.error('Error stopping audio:', error);
  }
};

export const stopAllSounds = async (audioArray) => {
  await Promise.all(audioArray.map(audio => stopAudio(audio)));
};