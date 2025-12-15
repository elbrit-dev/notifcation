import * as React from 'react';
import { PlasmicCanvasHost } from '@plasmicapp/loader-nextjs';
import { PLASMIC } from '../plasmic-init';

// Disable static optimization for this page to prevent re-renders
export const getServerSideProps = async () => {
  return { props: {} };
};

export default function PlasmicHost() {
  return PLASMIC && <PlasmicCanvasHost />;
}
