export type SearchLocation = {
    latitude?: number | null;
    longitude?: number | null;
    city?: string | null;
    state?: string | null;
};
type LocationCandidate = SearchLocation & {
    id: string;
};
export declare function rankCandidatesByProximity<T extends LocationCandidate>(candidates: T[], viewer: SearchLocation): T[];
export {};
