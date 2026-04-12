import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(160deg, #050508 0%, #080415 50%, #050510 100%)' }}>
      {/* 背景の光彩 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-56 w-96 h-96 rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #ff2d78, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #00b4ff, transparent)', filter: 'blur(80px)' }} />
      </div>
      <Sidebar />
      <main className="flex-1 ml-56 p-8 overflow-auto relative" style={{ zIndex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
