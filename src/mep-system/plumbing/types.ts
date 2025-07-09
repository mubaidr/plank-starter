export type PlumbingType = 'sink' | 'toilet' | 'shower' | 'bathtub' | 'faucet' | 'water_heater' | 'drain' | 'vent' | 'shutoff' | 'meter';

export interface PlumbingProperties {
  pipeSize: string;
  material: 'copper' | 'pex' | 'pvc' | 'cast_iron';
  pressure?: number;
  flow_rate?: number;
}

export interface PlumbingElement {
  id: string;
  type: 'plumbing';
  elementType: PlumbingType;
  waterType: 'hot' | 'cold' | 'mixed';
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  visible: boolean;
  locked: boolean;
  layerId: string;
  properties: PlumbingProperties;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    version: number;
    tags?: string[];
  };
}
