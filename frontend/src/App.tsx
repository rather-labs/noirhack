import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ConnectButton from './components/ui/ConnectButton';

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-color-black text-color-white font-sans">
      <header className="flex items-center justify-between p-4">
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
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="p-6">
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
