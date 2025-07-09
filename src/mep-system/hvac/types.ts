export type HVACType = 'vent' | 'return' | 'unit' | 'duct' | 'thermostat' | 'fan' | 'damper' | 'filter' | 'coil';

export interface HVACProperties {
  ductSize?: string;
  airflow?: number;
  temperature?: number;
  zoneId?: string;
}

export interface HVACElement {
  id: string;
  type: 'hvac';
  elementType: HVACType;
  capacity?: number;
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  visible: boolean;
  locked: boolean;
  layerId: string;
  properties: HVACProperties;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    version: number;
    tags?: string[];
  };
}
