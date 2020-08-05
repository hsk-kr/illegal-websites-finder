import { AnalyzedDataType, Stock } from './naver-stock-type';
import { fetchStockList } from './naver-stock-scraping';

/**
 * Analyze stock and then retruns AnalyzedDataType object.
 * If the stock doesn't have tradingHistory, returns undefined.
 * @param stock
 */
export const analyzeStock = (stock: Stock): AnalyzedDataType | null => {
    const analyzedData: AnalyzedDataType = {
        name: stock.name,
        detailPageUrl: stock.detailPageUrl,
        stockType: stock.stockType,
        weightValue: 0,
        continuousDays: 0,
    };

    const { tradingHistory } = stock;

    if (!tradingHistory || tradingHistory.length <= 0) {
        return null;
    }

    let continuousDays = 0;
    let weightValue = 0;
    for (let i = 0; i < tradingHistory.length; i++) {
        const { institution, foreigner, isRise } = tradingHistory[i];

        if (isRise || institution <= 0 || foreigner <= 0) {
            break;
        }

        continuousDays++;
        weightValue += (institution + foreigner);
    }

    analyzedData.continuousDays = continuousDays;
    analyzedData.weightValue = weightValue;

    return analyzedData;
};