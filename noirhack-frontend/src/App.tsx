import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="flex px-7 py-4">
        <h1 className="text-xl font-bold tracking-widest">
          on-chain<span className="font-light"> quests</span>
        </h1>
      </header>

      <main className="py-6 px-30">
        <Outlet />
      </main>
    </div>
  );
}
