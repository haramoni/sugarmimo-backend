export const RelationshipIntent = {
  Sugar: 'SUGAR',
  Traditional: 'TRADITIONAL',
  Both: 'BOTH',
} as const;

export type RelationshipIntentValue =
  (typeof RelationshipIntent)[keyof typeof RelationshipIntent];

export type RelationshipMode = RelationshipIntentValue | 'COMPATIBLE';

export function normalizeRelationshipIntent(
  value?: string | null,
): RelationshipIntentValue {
  const normalized = value?.trim().toUpperCase();

  return Object.values(RelationshipIntent).includes(
    normalized as RelationshipIntentValue,
  )
    ? (normalized as RelationshipIntentValue)
    : RelationshipIntent.Sugar;
}

export function resolveCompatibleRelationshipIntents(
  viewerIntent?: string | null,
  requestedMode?: string | null,
): RelationshipIntentValue[] {
  const viewer = normalizeRelationshipIntent(viewerIntent);
  const requested = requestedMode?.trim().toUpperCase() as
    | RelationshipMode
    | undefined;

  if (
    requested === RelationshipIntent.Sugar &&
    viewer !== RelationshipIntent.Traditional
  ) {
    return [RelationshipIntent.Sugar, RelationshipIntent.Both];
  }

  if (
    requested === RelationshipIntent.Traditional &&
    viewer !== RelationshipIntent.Sugar
  ) {
    return [RelationshipIntent.Traditional, RelationshipIntent.Both];
  }

  if (viewer === RelationshipIntent.Both) {
    return Object.values(RelationshipIntent);
  }

  return [viewer, RelationshipIntent.Both];
}

export function haveCompatibleRelationshipIntents(
  firstIntent?: string | null,
  secondIntent?: string | null,
) {
  const first = normalizeRelationshipIntent(firstIntent);
  const second = normalizeRelationshipIntent(secondIntent);

  return (
    first === RelationshipIntent.Both ||
    second === RelationshipIntent.Both ||
    first === second
  );
}
