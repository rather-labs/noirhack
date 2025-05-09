import React from 'react';

import {
  RouterProvider,
  type RouteObject,
  createBrowserRouter,
} from 'react-router-dom';
import { createRoot } from 'react-dom/client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App';
import Home from './pages/Home';
import QuestsPage from './pages/Quests';
import RiddleDetail from './pages/RiddleDetail';
import { wagmiConfig } from './config/wagmi-config';

import './index.css';
import { Toaster } from 'react-hot-toast';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/quests',
    element: <App />,
    children: [
      { index: true, element: <QuestsPage /> },
      { path: ':id', element: <RiddleDetail /> },
    ],
  },
];

const router = createBrowserRouter(routes);
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#1e293b', color: '#fff' },
          }}
        />
        <RouterProvider router={router} />
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
