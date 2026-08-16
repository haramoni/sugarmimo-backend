"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankCandidatesByProximity = rankCandidatesByProximity;
function rankCandidatesByProximity(candidates, viewer) {
    return candidates
        .map((candidate, originalIndex) => ({
        candidate,
        originalIndex,
        proximity: proximityScore(viewer, candidate),
    }))
        .sort((first, second) => first.proximity - second.proximity ||
        first.originalIndex - second.originalIndex)
        .map(({ candidate }) => candidate);
}
function proximityScore(viewer, candidate) {
    if (hasCoordinates(viewer) && hasCoordinates(candidate)) {
        return haversineDistanceKm(viewer, candidate);
    }
    const viewerCity = normalizePlace(viewer.city);
    const candidateCity = normalizePlace(candidate.city);
    const viewerState = normalizePlace(viewer.state);
    const candidateState = normalizePlace(candidate.state);
    if (viewerCity &&
        candidateCity &&
        viewerCity === candidateCity &&
        (!viewerState || !candidateState || viewerState === candidateState)) {
        return 25;
    }
    if (viewerState && candidateState && viewerState === candidateState) {
        return 250;
    }
    return Number.POSITIVE_INFINITY;
}
function hasCoordinates(location) {
    return (typeof location.latitude === 'number' &&
        Number.isFinite(location.latitude) &&
        typeof location.longitude === 'number' &&
        Number.isFinite(location.longitude));
}
function haversineDistanceKm(first, second) {
    const earthRadiusKm = 6371;
    const latitudeDelta = toRadians(second.latitude - first.latitude);
    const longitudeDelta = toRadians(second.longitude - first.longitude);
    const firstLatitude = toRadians(first.latitude);
    const secondLatitude = toRadians(second.latitude);
    const haversine = Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(firstLatitude) *
            Math.cos(secondLatitude) *
            Math.sin(longitudeDelta / 2) ** 2;
    return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}
function toRadians(value) {
    return (value * Math.PI) / 180;
}
function normalizePlace(value) {
    return value
        ?.trim()
        .toLocaleLowerCase('pt-BR')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}
//# sourceMappingURL=proximity-ranking.js.map