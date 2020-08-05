import {
  fetchStockList,
  fetchTradingHistory,
} from "./lib/naver-stock/naver-stock-scraping";
import { analyzeStock } from "./lib/naver-stock/naver-stock-anaylzer";
import {
  StockType,
  AnalyzedDataType,
  TradingHistory,
} from "./lib/naver-stock/naver-stock-type";
import {
  initializeTables,
  insertAnalyzedData,
} from "./lib/naver-stock/naver-stock-sqlite3-controller";

const fetchAndInsertStocks = async (stockType: StockType = "kospi") => {
  console.log(`start to fetch ${stockType} stocks`);

  const stocks: any = await fetchStockList(stockType);

  console.log(`fetch ${stockType} stocks done.`);
  for (let i = 0; i < stocks.length; i++) {
    const tradingHistory: TradingHistory[] = await fetchTradingHistory(
      stocks[i],
      2
    );
    stocks[i].tradingHistory = tradingHistory;
    const analyzedStock: AnalyzedDataType | null = analyzeStock(stocks[i]);
    if (analyzedStock !== null) {
      await insertAnalyzedData(analyzedStock);
    }
    console.log(`inserted ${i}th stock.`);
  }
  console.log(`inserted all of ${stockType} stocks into the db.`);
};

const fetchAndInsertKospiStocks = async () => {
  await fetchAndInsertStocks("kospi");
};

const fetchAndInsertKosdaqStocks = async () => {
  await fetchAndInsertStocks("kosdaq");
};

const main = async () => {
  console.log("Create tables if not exists");
  await initializeTables();
  await fetchAndInsertKospiStocks();
  await fetchAndInsertKosdaqStocks();
};

main();
