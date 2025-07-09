export interface BaseObject {
  id: string;
  type: string;
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  visible: boolean;
  locked: boolean;
  layerId: string;
  properties: Record<string, unknown>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    version: number;
    tags?: string[];
  };
}
