/**
 * Measurement formatting utilities
 */

import { Unit } from './conversion';

type FormatStyle = 'decimal' | 'fractional' | 'architectural';

export function formatMeasurement(
  value: number,
  unit: Unit,
  format: FormatStyle,
  precision: number
): string {
  if (format === 'decimal') {
    return `${value.toFixed(precision)} ${unit}`;
  }

  if (format === 'fractional') {
    return formatFractional(value, unit, precision);
  }

  if (format === 'architectural' && unit === 'feet') {
    return formatArchitectural(value, precision);
  }

  // Default to decimal for unsupported combinations
  return `${value.toFixed(precision)} ${unit}`;
}

function formatFractional(value: number, unit: Unit, precision: number): string {
  const whole = Math.floor(value);
  const fraction = value - whole;

  if (fraction === 0) return `${whole} ${unit}`;

  // Find closest fraction
  const denominator = Math.pow(2, precision);
  const numerator = Math.round(fraction * denominator);

  if (numerator === 0) return `${whole} ${unit}`;
  if (whole === 0) return `${numerator}/${denominator} ${unit}`;

  return `${whole} ${numerator}/${denominator} ${unit}`;
}

function formatArchitectural(value: number, precision: number): string {
  const feet = Math.floor(value);
  const inches = Math.round((value - feet) * 12);

  if (inches === 0) return `${feet}'`;
  return `${feet}' ${inches}"`;
}
