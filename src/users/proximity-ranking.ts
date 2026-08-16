export type SearchLocation = {
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  state?: string | null;
};

type LocationCandidate = SearchLocation & { id: string };

export function rankCandidatesByProximity<T extends LocationCandidate>(
  candidates: T[],
  viewer: SearchLocation,
) {
  return candidates
    .map((candidate, originalIndex) => ({
      candidate,
      originalIndex,
      proximity: proximityScore(viewer, candidate),
    }))
    .sort(
      (first, second) =>
        first.proximity - second.proximity ||
        first.originalIndex - second.originalIndex,
    )
    .map(({ candidate }) => candidate);
}

function proximityScore(viewer: SearchLocation, candidate: SearchLocation) {
  if (hasCoordinates(viewer) && hasCoordinates(candidate)) {
    return haversineDistanceKm(viewer, candidate);
  }

  const viewerCity = normalizePlace(viewer.city);
  const candidateCity = normalizePlace(candidate.city);
  const viewerState = normalizePlace(viewer.state);
  const candidateState = normalizePlace(candidate.state);

  if (
    viewerCity &&
    candidateCity &&
    viewerCity === candidateCity &&
    (!viewerState || !candidateState || viewerState === candidateState)
  ) {
    return 25;
  }

  if (viewerState && candidateState && viewerState === candidateState) {
    return 250;
  }

  return Number.POSITIVE_INFINITY;
}

function hasCoordinates(
  location: SearchLocation,
): location is SearchLocation & { latitude: number; longitude: number } {
  return (
    typeof location.latitude === 'number' &&
    Number.isFinite(location.latitude) &&
    typeof location.longitude === 'number' &&
    Number.isFinite(location.longitude)
  );
}

function haversineDistanceKm(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function normalizePlace(value?: string | null) {
  return value
    ?.trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
