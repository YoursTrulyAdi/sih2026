import React from 'react';
import dynamic from 'next/dynamic';
import { InfraDigitalTwinFallback } from './InfraDigitalTwin';

const InfraDigitalTwinScene = dynamic(
  () => import('./InfraDigitalTwin').then((mod) => mod.InfraDigitalTwinScene),
  {
    ssr: false,
    loading: () => <InfraDigitalTwinFallback />,
  }
);

export default function DigitalTwinWrapper() {
  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[500px]">
      <InfraDigitalTwinScene />
    </div>
  );
}
