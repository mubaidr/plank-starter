"use client";
import React from 'react';
import { FloorPlanProvider } from '@/context/FloorPlanContext';
import { ToolProvider } from '@/context/ToolContext';
import FloorPlanApp from '@/components/FloorPlanApp';

const HomePage: React.FC = () => {
  return (
    <FloorPlanProvider>
      <ToolProvider>
        <FloorPlanApp />
      </ToolProvider>
    </FloorPlanProvider>
  );
};

export default HomePage;