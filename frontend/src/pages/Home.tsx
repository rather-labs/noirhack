import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';

const words = ['discover', 'play', 'win'];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.5 } },
};

const word: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function Home() {
  const buttonDelay = words.length * 0.5 + 0.3;

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-color-black">
      {/* Words row */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex space-x-4 text-5xl sm:text-6xl font-bold font-sans text-white">
        {words.map((w) => (
          <motion.span key={w} variants={word} className="lowercase">
            {w}.
          </motion.span>
        ))}
      </motion.div>

      {/* Delayed Start button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: buttonDelay,
          duration: 0.8,
          ease: 'easeOut',
        }}
        className="mt-12">
        <Link to="/quests">
          <motion.span
            /* Breathing glow already animating in background */
            animate={{
              boxShadow: [
                '0 0 0px rgba(124,58,237, 0.3)',
                '0 0 20px rgba(124,58,237, 0.8)',
                '0 0 0px rgba(124,58,237, 0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            whileHover={{ scale: 1.03 }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-accent-riddle px-8 py-3 text-sm font-semibold uppercase tracking-wide text-accent-riddle">
            <span>Start</span>
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 300 }}>
              →
            </motion.span>
          </motion.span>
        </Link>
      </motion.div>
    </div>
  );
}
