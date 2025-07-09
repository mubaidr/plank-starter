import { BaseObject } from './coreTypes';

export type HVACType = 'vent' | 'return' | 'unit' | 'duct' | 'thermostat' | 'fan' | 'damper' | 'filter' | 'coil';

export interface HVACProperties {
  ductSize?: string;
  airflow?: number;
  temperature?: number;
  zoneId?: string;
}

export interface HVACElement extends BaseObject {
  type: 'hvac';
  elementType: HVACType;
  capacity?: number;
  properties: HVACProperties;
}
