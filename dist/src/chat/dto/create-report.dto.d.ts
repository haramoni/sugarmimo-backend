export declare const CHAT_REPORT_CATEGORIES: readonly ["HARASSMENT", "THREAT", "FRAUD", "INAPPROPRIATE_SEXUAL_CONTENT", "EXTORTION", "SPAM", "FAKE_PROFILE", "OTHER"];
export declare class CreateReportDto {
    category: (typeof CHAT_REPORT_CATEGORIES)[number];
    details?: string;
    messageIds: string[];
    blockUser?: boolean;
}
