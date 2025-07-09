"use client";
import React from 'react';
import { FloorPlanProvider } from '@/context/FloorPlanContext';
import { ToolProvider } from '@/context/ToolContext';
import { FileOperationsProvider } from '@/context/FileOperationsContext';
import FloorPlanApp from '@/components/FloorPlanApp';

const HomePage: React.FC = () => {
  return (
    <FloorPlanProvider>
      <ToolProvider>
        <FileOperationsProvider>
          <FloorPlanApp />
        </FileOperationsProvider>
      </ToolProvider>
    </FloorPlanProvider>
  );
};

export default HomePage;