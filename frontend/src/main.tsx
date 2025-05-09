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

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'quests', element: <QuestsPage /> },
      { path: 'quests/:id', element: <RiddleDetail /> },
    ],
  },
];

const router = createBrowserRouter(routes);
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RouterProvider router={router} />
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
