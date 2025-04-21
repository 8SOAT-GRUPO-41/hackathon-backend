import { ValueObject } from '@/domain/common/vo';

// Create a concrete implementation of the abstract ValueObject class for testing
class TestValueObject extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }
}

// Another implementation with different type
class NumericValueObject extends ValueObject<number> {
  constructor(value: number) {
    super(value);
  }
}

describe('ValueObject Abstract Class', () => {
  describe('constructor', () => {
    it('should create a value object with the given value', () => {
      const value = 'test-value';
      const vo = new TestValueObject(value);

      expect(vo.value).toBe(value);
    });
  });

  describe('value getter', () => {
    it('should return the stored value', () => {
      const value = 'test-value';
      const vo = new TestValueObject(value);

      expect(vo.value).toBe(value);
    });

    it('should work with different value types', () => {
      const numValue = 42;
      const numVo = new NumericValueObject(numValue);

      expect(numVo.value).toBe(numValue);
    });
  });

  describe('equals method', () => {
    it('should return true for value objects with the same value', () => {
      const value = 'test-value';
      const vo1 = new TestValueObject(value);
      const vo2 = new TestValueObject(value);

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for value objects with different values', () => {
      const vo1 = new TestValueObject('value1');
      const vo2 = new TestValueObject('value2');

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const vo = new TestValueObject('test-value');

      expect(vo.equals(undefined)).toBe(false);
    });

    it('should not be affected by object identity', () => {
      const value = 'same-value';
      const vo1 = new TestValueObject(value);
      const vo2 = new TestValueObject(value);

      // Different object references but same value
      expect(Object.is(vo1, vo2)).toBe(false);
      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should work with different value types', () => {
      const numVo1 = new NumericValueObject(42);
      const numVo2 = new NumericValueObject(42);
      const numVo3 = new NumericValueObject(24);

      expect(numVo1.equals(numVo2)).toBe(true);
      expect(numVo1.equals(numVo3)).toBe(false);
    });
  });
});
