import { describe, it, expect } from 'vitest';
import { LONG_DRESS_MEASUREMENTS } from '../src/public-site/LongDressIllustration';
import {
  validateLongDressMeasurement,
  areAllLongDressMeasurementsValid,
} from '../src/public-site/LongDressMeasurementSection';
import {
  createEmptyPublicAddress,
  validatePublicAddress,
} from '../src/public-site/PublicAddressForm';

describe('Public Website Long Dress Measurements & Checkout Address Validation', () => {
  it('defines exactly 13 Long Dress measurements in exact approved order', () => {
    expect(LONG_DRESS_MEASUREMENTS).toHaveLength(13);
    expect(LONG_DRESS_MEASUREMENTS.map((m) => `${m.num}. ${m.label}`)).toEqual([
      '1. Shoulder',
      '2. Length',
      '3. X Front',
      '4. Bust',
      '5. Under Bust',
      '6. Waist',
      '7. Low Waist',
      '8. Hips',
      '9. SLV Full Length',
      '10. Arm Hole',
      '11. Muscle',
      '12. Elbow',
      '13. Cuff',
    ]);
  });

  it('rejects blank, zero, negative, and invalid measurement values', () => {
    expect(validateLongDressMeasurement('')).not.toBeNull();
    expect(validateLongDressMeasurement('0')).not.toBeNull();
    expect(validateLongDressMeasurement('-5')).not.toBeNull();
    expect(validateLongDressMeasurement('abc')).not.toBeNull();
    expect(validateLongDressMeasurement('14.5')).toBeNull();
  });

  it('requires all 13 Long Dress measurements to be valid before submission', () => {
    const partial: Record<string, string> = {};
    LONG_DRESS_MEASUREMENTS.slice(0, 12).forEach((m) => {
      partial[m.key] = '15';
    });
    expect(areAllLongDressMeasurementsValid(partial)).toBe(false);

    const complete = { ...partial, [LONG_DRESS_MEASUREMENTS[12].key]: '8.5' };
    expect(areAllLongDressMeasurementsValid(complete)).toBe(true);
  });

  it('blocks public checkout when mandatory address fields are missing or invalid', () => {
    const empty = createEmptyPublicAddress();
    const errs = validatePublicAddress(empty);
    expect(errs.fullName).toBeDefined();
    expect(errs.mobileNumber).toBeDefined();
    expect(errs.doorNo).toBeDefined();
    expect(errs.streetArea).toBeDefined();
    expect(errs.city).toBeDefined();
    expect(errs.district).toBeDefined();
    expect(errs.pinCode).toBeDefined();

    const valid = {
      ...empty,
      fullName: 'Ananya Sharma',
      mobileNumber: '9876543210',
      email: 'ananya@example.com',
      doorNo: '12A',
      streetArea: 'Gandhi Road',
      landmark: 'Near Clock Tower',
      city: 'Erode',
      district: 'Erode',
      state: 'Tamil Nadu',
      pinCode: '638001',
      country: 'India',
    };
    expect(validatePublicAddress(valid)).toEqual({});
  });
});
