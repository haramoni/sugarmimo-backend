export declare const RelationshipIntent: {
    readonly Sugar: "SUGAR";
    readonly Traditional: "TRADITIONAL";
    readonly Both: "BOTH";
};
export type RelationshipIntentValue = (typeof RelationshipIntent)[keyof typeof RelationshipIntent];
export type RelationshipMode = RelationshipIntentValue | 'COMPATIBLE';
export declare function normalizeRelationshipIntent(value?: string | null): RelationshipIntentValue;
export declare function resolveCompatibleRelationshipIntents(viewerIntent?: string | null, requestedMode?: string | null): RelationshipIntentValue[];
export declare function haveCompatibleRelationshipIntents(firstIntent?: string | null, secondIntent?: string | null): boolean;
