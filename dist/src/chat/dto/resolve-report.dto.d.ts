export declare const CHAT_REPORT_ACTIONS: readonly ["DISMISSED", "WARNED", "SUSPENDED", "BANNED"];
export declare class ResolveReportDto {
    action: (typeof CHAT_REPORT_ACTIONS)[number];
    resolution: string;
    suspensionDays?: number;
}
