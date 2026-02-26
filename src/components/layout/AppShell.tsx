import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      <main className="md:ml-64 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
