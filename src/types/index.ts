import { z } from 'zod';

// Re-export all type definitions
export * from './electricalTypes';
export * from './plumbingTypes';
export * from './hvacTypes';
export * from './floorPlanTypes';
export * from './mepTypes';

// Base object interface
export interface FloorPlanObject {
  id: string;
  type: string;
  position: { x: number; y: number };
  rotation: number;
  scale: { x:极 number; y: number };
  visible: boolean;
  locked: boolean;
  layerId: string;
  properties: Record<string, any>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    version: number;
    tags?: string[];
  };
}

// Project data interface
export interface ProjectData {
  version: string;
  metadata: {
    name: string;
    description: string;
    author: string;
    created: string;
    modified: string;
    scale: number;
    units: string;
  };
  objects: FloorPlanObject[];
  layers: Array<{
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    color: string;
  }>;
  measurements: Array<{
    id: string;
    type: 'linear' | 'angular' | 'area' | 'radius';
    startPoint: { x: number; y: number };
    endPoint?: { x: number; y: number };
    centerPoint?: { x: number; y: number };
    points?: Array<{ x: number; y: number }>;
    value: number;
    label: string;
    units: string;
    style: Record<string, any>;
  }>;
  settings: {
    unitSystem: 'imperial' | 'metric';
    displayFormat: 'decimal' | 'fractional' | 'architectural';
    precision: number;
    gridSize: number;
    gridVisible: boolean;
    snapToGrid: boolean;
    snapToObjects: boolean;
    backgroundImage?: {
      src: string;
      opacity: number;
      scale: number;
      position: { x: number; y: number };
    };
  };
}

// Zod schema for ProjectData validation
export const ProjectDataSchema = z.object({
  version: z.string(),
  metadata: z.object({
    name: z.string(),
    description: z.string().optional(),
    author: z.string(),
    created: z.string(),
    modified: z.string(),
    scale: z.number(),
    units: z.string()
  }),
  objects: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    rotation: z.number(),
    scale: z.object({ x: z.number(), y: z.number() }),
    visible: z.boolean(),
    locked: z.boolean(),
    layerId: z.string(),
    properties: z.record(z.any()),
    metadata: z.object({
      createdAt: z.date(),
      updatedAt: z.date(),
      createdBy: z.string().optional(),
      version: z.number(),
      tags: z.array(z.string()).optional()
    })
  })),
  layers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    visible: z.boolean(),
    locked: z.boolean(),
    color: z.string()
  })),
  measurements: z.array(z.object({
    id: z.string(),
    type: z.enum(['linear', 'angular', 'area', 'radius']),
    startPoint: z.object({ x: z.number(), y: z.number() }),
    endPoint: z.object({ x: z.number(), y: z极.number() }).optional(),
    centerPoint: z.object({ x: z.number(), y: z.number() }).optional(),
    points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
    value: z.number(),
    label: z.string(),
    units: z.string(),
    style: z.record(z.any())
  })),
  settings: z.object({
    gridSize: z.number(),
    gridVisible: z.boolean(),
    snapToGrid: z.boolean(),
    snapToObjects: z.boolean(),
    backgroundImage: z.object({
      src: z.string(),
      opacity: z.number(),
      scale: z.number(),
      position: z.object({ x: z.number(), y: z.number() })
    }).optional()
  })
});
