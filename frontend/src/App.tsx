import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ConnectButton from './components/ui/ConnectButton';

export default function App() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-color-black text-color-white font-sans">
      <header className="absolute w-full flex items-center justify-between p-4 z-100">
        <h1 className="text-xl font-bold tracking-widest">
          on-chain<span className="font-light"> quests</span>
        </h1>
        <ConnectButton />
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative min-h-screen p-6">
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <footer
        role="contentinfo"
        className="absolute bottom-5 w-full flex justify-center gap-0
             text-sm pt-5 text-white border-t border-white/10">
        <img
          src="https://cdn.prod.website-files.com/629ffbf53482a7f051677d6b/64bad8b2f17c29463caffcc9_logo%20RL.svg"
          loading="lazy"
          alt="Rather Labs logo"
        />
      </footer>
    </div>
  );
}
