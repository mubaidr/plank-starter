import { useFloorPlanContext } from '@/context/FloorPlanContext';
import { autoConvert, convert, formatMeasurement, Unit } from '@/utils/units';

export function useUnitSystem() {
  const { state } = useFloorPlanContext();
  const { unitSystem, displayFormat, precision } = state.project;

  return {
    convert: (value: number, from: Unit, to?: Unit) => {
      if (to) return convert(value, from, to);
      const [convertedValue, targetUnit] = autoConvert(value, from, unitSystem);
      return convertedValue;
    },
    format: (value: number, unit: Unit) =>
      formatMeasurement(value, unit, displayFormat, precision),
    autoConvert: (value: number, unit: Unit) =>
      autoConvert(value, unit, unitSystem),
    currentSystem: unitSystem,
    currentFormat: displayFormat
  };
}
