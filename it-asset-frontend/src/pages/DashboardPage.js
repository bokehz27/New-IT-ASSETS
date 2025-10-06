import React from "react";
import { Wrench } from 'lucide-react'; // Import an icon for visual flair

function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-slate-400">
      <Wrench className="w-24 h-24 mb-6" strokeWidth={1} />
      <h1 className="text-6xl font-bold tracking-widest">
        DEVELOPING
      </h1>
      <p className="mt-3 text-lg text-slate-500">
        This page is currently under construction.
      </p>
    </div>
  );
}

export default DashboardPage;