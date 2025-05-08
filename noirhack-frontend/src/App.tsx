import { Outlet, NavLink } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold tracking-widest">
          on-chain<span className="font-light"> quests</span>
        </h1>
        <nav className="space-x-4 text-sm uppercase">
          <NavLink to="/" end className="hover:underline">
            Home
          </NavLink>
          <NavLink to="/quests" className="hover:underline">
            Quests
          </NavLink>
        </nav>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
