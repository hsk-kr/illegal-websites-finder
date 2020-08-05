export interface URLS {
    [key: string]: string;
}

export interface Stock {
    name: string;
    detailPageUrl: string;
    stockType: string;
    tradingHistory?: TradingHistory[]
}

export type StockType = "kospi" | "kosdaq";

export interface TradingHistory {
    institution: number;
    foreigner: number;
    isRise: boolean;
    date: object;
}

export interface AnalyzedDataType {
    name: string;
    detailPageUrl: string;
    stockType: string;
    weightValue: number;
    continuousDays: number;
}