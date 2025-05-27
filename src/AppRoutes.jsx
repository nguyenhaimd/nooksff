import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ManagersPage from './pages/ManagersPage';
import MatchupsPage from './pages/MatchupsPage';
import TransactionsPage from './pages/TransactionsPage';
import SeasonsPage from './pages/SeasonsPage';
import RecordsPage from './pages/RecordsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/managers" element={<ManagersPage />} />
        <Route path="/matchups" element={<MatchupsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/seasons" element={<SeasonsPage />} />
        <Route path="/records" element={<RecordsPage />} />
      </Route>
    </Routes>
  );
}