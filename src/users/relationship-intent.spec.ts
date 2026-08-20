import {
  haveCompatibleRelationshipIntents,
  RelationshipIntent,
  resolveCompatibleRelationshipIntents,
} from './relationship-intent';

describe('relationship intent compatibility', () => {
  it('keeps legacy users compatible with Sugar and Both profiles', () => {
    expect(resolveCompatibleRelationshipIntents(null, 'COMPATIBLE')).toEqual([
      RelationshipIntent.Sugar,
      RelationshipIntent.Both,
    ]);
  });

  it('lets a Both user switch to the Traditional discovery mode', () => {
    expect(
      resolveCompatibleRelationshipIntents(
        RelationshipIntent.Both,
        RelationshipIntent.Traditional,
      ),
    ).toEqual([RelationshipIntent.Traditional, RelationshipIntent.Both]);
  });

  it('does not let a Sugar-only user request Traditional profiles', () => {
    expect(
      resolveCompatibleRelationshipIntents(
        RelationshipIntent.Sugar,
        RelationshipIntent.Traditional,
      ),
    ).toEqual([RelationshipIntent.Sugar, RelationshipIntent.Both]);
  });

  it('requires at least one shared intention', () => {
    expect(
      haveCompatibleRelationshipIntents(
        RelationshipIntent.Sugar,
        RelationshipIntent.Traditional,
      ),
    ).toBe(false);
    expect(
      haveCompatibleRelationshipIntents(
        RelationshipIntent.Sugar,
        RelationshipIntent.Both,
      ),
    ).toBe(true);
  });
});
