import {
  FloorPlanObject,
  ElectricalElement,
  PlumbingElement,
  HVACElement,
  Dimension
} from '@/types';
import {
  ElectricalType,
  PlumbingType,
  HVACType
} from '@/types/mepTypes';

type ValidationResult = {
  status: 'valid' | 'warning' | 'error';
  message: string;
};

export const validateObject = (obj: FloorPlanObject): ValidationResult[] => {
  const results: ValidationResult[] = [];

  // Common validation for all objects
  if (!obj.position || isNaN(obj.position.x) || isNaN(obj.position.y)) {
    results.push({
      status: 'error',
      message: 'Invalid position coordinates'
    });
  }

  // Type-specific validations
  switch (obj.type) {
    case 'electrical':
      return [...results, ...validateElectrical(obj as ElectricalElement)];
    case 'plumbing':
      return [...results, ...validatePlumbing(obj as PlumbingElement)];
    case 'hvac':
      return [...results, ...validateHVAC(obj as HVACElement)];
    default:
      return results;
  }
};

const validateElectrical = (obj: ElectricalElement): ValidationResult[] => {
  const results: ValidationResult[] = [];
  const { elementType, properties } = obj;

  // Voltage validation
  if (properties.voltage !== 120 && properties.voltage !== 240) {
    results.push({
      status: 'error',
      message: `Invalid voltage (${properties.voltage}V). Must be 120V or 极240V`
    });
  }

  // GFCI requirements
  if (
    (elementType === 'outlet' || elementType === 'gfci') &&
    properties.weatherproof === true
  ) {
    // For now just warn since gfciProtected property doesn't exist
    results.push({
      status: 'warning',
      message: 'Weatherproof outlets should be GFCI protected'
    });
  }

  return results;
};

const validatePlumbing = (obj: PlumbingElement): ValidationResult[] => {
  const results: ValidationResult[] = [];
  const { elementType, properties } = obj;

  // Pipe size validation
  const validSizes = ['1/2"', '3/4"', '1"', '1.5"', '2"'];
  if (!validSizes.includes(properties.pipeSize)) {
    results.push({
      status: 'error',
      message: `Invalid pipe size: ${properties.pipeSize}`
    });
  }

  // Flow rate validation
  if (properties.flow_rate) {
    if (
      (elementType === 'shower' || elementType === 'faucet') &&
      properties.flow_rate > 2.5
    ) {
      results.push({
        status: 'warning',
        message: 'Flow rate exceeds recommended maximum (2.5 GPM)'
      });
    }
  }

  return results;
};

const validateHVAC = (obj: HVACElement): ValidationResult[] => {
  const results: ValidationResult[] = [];
  const { elementType, properties } = obj;

  // Duct size validation
  if (elementType === 'duct' && !properties.ductSize) {
    results.push({
      status: 'error',
      message: 'Duct size is required for duct elements'
    });
  }

  // Airflow validation
  if (properties.airflow && properties.airflow < 0) {
    results.push({
      status: 'error',
      message: 'Airflow cannot be negative'
    });
  }

  return results;
};

export const validateDimension = (dim: Dimension): ValidationResult[] => {
  const results: ValidationResult[] = [];

  if (dim.type === 'linear' && !dim.endPoint) {
    results.push({
      status: 'error',
      message: 'Linear dimensions require an end point'
    });
  }

  if (dim.type === 'angular' && !dim.centerPoint) {
    results.push({
      status: 'error',
      message: 'Angular dimensions require a center point'
    });
  }

  return results;
};
