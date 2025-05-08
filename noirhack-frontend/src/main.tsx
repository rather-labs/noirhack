import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom';
import App from './App';
import './index.css';
import Home from './pages/Home';
import QuestsPage from './pages/Quests';
import RiddleDetail from './pages/RiddleDetail';

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

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
