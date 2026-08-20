"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipIntent = void 0;
exports.normalizeRelationshipIntent = normalizeRelationshipIntent;
exports.resolveCompatibleRelationshipIntents = resolveCompatibleRelationshipIntents;
exports.haveCompatibleRelationshipIntents = haveCompatibleRelationshipIntents;
exports.RelationshipIntent = {
    Sugar: 'SUGAR',
    Traditional: 'TRADITIONAL',
    Both: 'BOTH',
};
function normalizeRelationshipIntent(value) {
    const normalized = value?.trim().toUpperCase();
    return Object.values(exports.RelationshipIntent).includes(normalized)
        ? normalized
        : exports.RelationshipIntent.Sugar;
}
function resolveCompatibleRelationshipIntents(viewerIntent, requestedMode) {
    const viewer = normalizeRelationshipIntent(viewerIntent);
    const requested = requestedMode?.trim().toUpperCase();
    if (requested === exports.RelationshipIntent.Sugar &&
        viewer !== exports.RelationshipIntent.Traditional) {
        return [exports.RelationshipIntent.Sugar, exports.RelationshipIntent.Both];
    }
    if (requested === exports.RelationshipIntent.Traditional &&
        viewer !== exports.RelationshipIntent.Sugar) {
        return [exports.RelationshipIntent.Traditional, exports.RelationshipIntent.Both];
    }
    if (viewer === exports.RelationshipIntent.Both) {
        return Object.values(exports.RelationshipIntent);
    }
    return [viewer, exports.RelationshipIntent.Both];
}
function haveCompatibleRelationshipIntents(firstIntent, secondIntent) {
    const first = normalizeRelationshipIntent(firstIntent);
    const second = normalizeRelationshipIntent(secondIntent);
    return (first === exports.RelationshipIntent.Both ||
        second === exports.RelationshipIntent.Both ||
        first === second);
}
//# sourceMappingURL=relationship-intent.js.map