import { BaseObject } from './coreTypes';

export type PlumbingType = 'sink' | 'toilet' | 'shower' | 'bathtub' | 'faucet' | 'water_heater' | 'drain' | 'vent' | 'shutoff' | 'meter';

export interface PlumbingProperties {
  pipeSize: string;
  material: 'copper' | 'pex' | 'pvc' | 'cast_iron';
  pressure?: number;
  flow_rate?: number;
}

export interface PlumbingElement extends BaseObject {
  type: 'plumbing';
  elementType: PlumbingType;
  waterType: 'hot' | 'cold' | 'mixed';
  properties: PlumbingProperties;
}
