export type ElectricalType = 'outlet' | 'switch' | 'light' | 'panel' | 'junction' | 'gfci' | 'dimmer' | 'fan' | 'smoke_detector' | 'security';
export type PlumbingType = 'sink' | 'toilet' | 'shower' | 'bathtub' | 'faucet' | 'water_heater' | 'drain' | 'vent' | 'shutoff' | 'meter';
export type HVACType = 'vent' | 'return' | 'unit' | 'duct' | 'thermostat' | 'fan' | 'damper' | 'filter' | 'coil';

export interface ElectricalProperties {
  voltage: number;
  amperage?: number;
  circuitId?: string;
  height: number;
  dedicated: boolean;
  weatherproof?: boolean;
  smartEnabled?: boolean;
}

export interface PlumbingProperties {
  pipeSize: string;
  material: 'copper' | 'pex' | 'pvc' | 'cast_iron';
  pressure?: number;
  flow_rate?: number;
}

export interface HVACProperties {
  ductSize?: string;
  airflow?: number;
  temperature?: number;
  zoneId?: string;
}

export interface ElectricalElement {
  type: 'electrical';
  elementType: ElectricalType;
  properties: ElectricalProperties;
}

export interface PlumbingElement {
  type: 'plumbing';
  elementType: PlumbingType;
  waterType: 'hot' | 'cold' | 'mixed';
  properties: PlumbingProperties;
}

export interface HVACElement {
  type: 'hvac';
  elementType: HVACType;
  capacity?: number;
  properties: HVACProperties;
}
