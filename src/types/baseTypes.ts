export interface BaseObject {
  id: string;
  type: string;
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
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
