import { BaseObject } from './coreTypes';

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

export interface ElectricalElement extends BaseObject {
  type: 'electrical';
  elementType: ElectricalType;
  properties: ElectricalProperties;
}
