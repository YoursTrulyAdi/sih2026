import React from 'react';
import dynamic from 'next/dynamic';

const DynamicBackground = dynamic(
  () => import('./ScrollLinkedBackground').then((mod) => mod.ScrollLinkedBackgroundContent),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function ScrollLinkedBackgroundWrapper() {
  return <DynamicBackground />;
}
