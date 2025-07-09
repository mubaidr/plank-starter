export type ElectricalType = 'outlet' | 'switch' | 'light' | 'panel' | 'junction' | 'gfci' | 'dimmer' | 'fan' | 'smoke_detector' | 'security';

export interface ElectricalProperties {
  voltage: number;
  amperage?: number;
  circuitId?: string;
  height: number;
  dedicated: boolean;
  weatherproof?: boolean;
  smartEnabled?: boolean;
}

export interface ElectricalElement {
  id: string;
  type: 'electrical';
  elementType: ElectricalType;
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  visible: boolean;
  locked: boolean;
  layerId: string;
  properties: ElectricalProperties;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    version: number;
    tags?: string[];
  };
}
