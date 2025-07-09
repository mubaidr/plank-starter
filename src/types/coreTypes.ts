export interface Point {
  x: number;
  y: number;
}

export interface Metadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  version: number;
  tags?: string[];
}

export interface BaseObject {
  id: string;
  type: string;
  position: Point;
  rotation: number;
  scale: Point;
  visible: boolean;
  locked: boolean;
  layerId: string;
  properties: Record<string, any>;
  metadata: Metadata;
}
