import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { homecomingDate } from '../data/content';

// Custom hook for countdown logic
const useCountdown = (targetDate: string) => {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isDone: true
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isDone: false
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

// Confetti component that shows when countdown is done
const Confetti = ({ show }: { show: boolean }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  if (!show || prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          initial={{
            top: '0%',
            left: `${Math.random() * 100}%`,
            backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
            scale: 0
          }}
          animate={{
            top: '100%',
            scale: [0, 1, 0.5],
            rotate: Math.random() * 360
          }}
          transition={{
            duration: 2.5 + Math.random() * 3,
            ease: "easeOut",
            delay: Math.random() * 0.5
          }}
        />
      ))}
    </div>
  );
};

// Time unit display component
const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="text-3xl md:text-5xl font-bold bg-white/10 rounded-xl px-4 py-2 min-w-[80px] md:min-w-[120px]">
      {value.toString().padStart(2, '0')}
    </div>
    <div className="text-sm md:text-base mt-2 text-zinc-300" aria-label={label}>
      {label}
    </div>
  </div>
);

const Countdown = () => {
  const { days, hours, minutes, seconds, isDone } = useCountdown(homecomingDate);
  const [showConfetti, setShowConfetti] = useState(false);

  // Show confetti when countdown completes
  useEffect(() => {
    if (isDone && !showConfetti) {
      setShowConfetti(true);
      
      // Hide confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isDone, showConfetti]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <Confetti show={showConfetti} />
      
      <div className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 shadow-lg">
        <h3 className="text-xl md:text-2xl mb-6 text-center">
          {isDone ? "Welcome Home!" : "Countdown to Homecoming"}
        </h3>
        
        <AnimatePresence mode="wait">
          {isDone ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-transparent bg-clip-text animate-gradient-x">
                Welcome Home!
              </div>
              <p className="mt-4 text-lg md:text-xl text-zinc-300">
                We've missed you so much!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center gap-4 md:gap-8"
            >
              <TimeUnit value={days} label="Days" />
              <TimeUnit value={hours} label="Hours" />
              <TimeUnit value={minutes} label="Minutes" />
              <TimeUnit value={seconds} label="Seconds" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Countdown;
