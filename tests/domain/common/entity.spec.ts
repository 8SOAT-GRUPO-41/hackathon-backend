import { Entity } from '@/domain/common/entity';

// Create a concrete implementation of the abstract Entity class for testing
class TestEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

describe('Entity Abstract Class', () => {
  describe('constructor', () => {
    it('should create an entity with the given id', () => {
      const id = 'test-id-123';
      const entity = new TestEntity(id);

      expect(entity.id).toBe(id);
    });
  });

  describe('id getter', () => {
    it('should return the entity id', () => {
      const id = 'test-id-123';
      const entity = new TestEntity(id);

      expect(entity.id).toBe(id);
    });
  });

  describe('equals method from standard object', () => {
    it('should be true for same entity reference', () => {
      const entity = new TestEntity('test-id');

      // Same reference should be equal
      expect(Object.is(entity, entity)).toBe(true);
    });

    it('should be false for different entities, even with same ID', () => {
      const id = 'test-id-123';
      const entity1 = new TestEntity(id);
      const entity2 = new TestEntity(id);

      // Different references should not be equal by default JavaScript equals
      expect(Object.is(entity1, entity2)).toBe(false);
    });
  });
});
