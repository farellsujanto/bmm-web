import { Suspense } from 'react';
import ActivityContent from './components/ActivityContent';

export default function ActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    }>
      <ActivityContent />
    </Suspense>
  );
}
