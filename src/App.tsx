import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Statements from '@/pages/Statements';
import Ratios from '@/pages/Ratios';
import Anomalies from '@/pages/Anomalies';
import Reports from '@/pages/Reports';
import DataCenter from '@/pages/DataCenter';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/statements" element={<Statements />} />
          <Route path="/ratios" element={<Ratios />} />
          <Route path="/anomalies" element={<Anomalies />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/data" element={<DataCenter />} />
        </Route>
      </Routes>
    </Router>
  );
}
