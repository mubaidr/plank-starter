/**
 * Unit conversion utilities for the floor plan application
 */

export type Unit = 'inches' | 'feet' | 'meters' | 'centimeters' | 'millimeters';

// Conversion factors relative to meters (base unit)
const CONVERSION_FACTORS: Record<Unit, number> = {
  inches: 0.0254,
  feet: 0.3048,
  meters: 1,
  centimeters: 0.01,
  millimeters: 0.001
};

export function convert(value: number, from: Unit, to: Unit): number {
  const inMeters = value * CONVERSION_FACTORS[from];
  return inMeters / CONVERSION_FACTORS[to];
}

export function autoConvert(value: number, unit: Unit, targetSystem: 'imperial' | 'metric'): [number, Unit] {
  if (targetSystem === 'imperial') {
    const inFeet = convert(value, unit, 'feet');
    return inFeet >= 1 ? [inFeet, 'feet'] : [convert(value, unit, 'inches'), 'inches'];
  } else {
    const inMeters = convert(value, unit, 'meters');
    return inMeters >= 1 ? [inMeters, 'meters'] : [convert(value, unit, 'centimeters'), 'centimeters'];
  }
}
