import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar, BottomNav, MobileHeader } from './components/Navigation';
import { ToastProvider } from './components/Toast';

// Views
import Dashboard from './views/Dashboard';
import Attendance from './views/Attendance';
import Timetable from './views/Timetable';
import Deadlines from './views/Deadlines';
import CgpaTracker from './views/CgpaTracker';
import Professors from './views/Professors';
import YoutubeChannels from './views/YoutubeChannels';
import StudyResources from './views/StudyResources';
import CampusSpots from './views/CampusSpots';

export default function App() {
  return (
    <ToastProvider>
      <div className="app-layout">
        {/* Navigation Sidebar (Desktop) */}
        <Sidebar />

        {/* Mobile Header / Top Bar (Phone) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <MobileHeader />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/deadlines" element={<Deadlines />} />
              <Route path="/cgpa" element={<CgpaTracker />} />
              <Route path="/professors" element={<Professors />} />
              <Route path="/youtube" element={<YoutubeChannels />} />
              <Route path="/resources" element={<StudyResources />} />
              <Route path="/spots" element={<CampusSpots />} />
            </Routes>
          </main>
          
          {/* Bottom Bar Navigation (Mobile) */}
          <BottomNav />
        </div>
      </div>
    </ToastProvider>
  );
}
