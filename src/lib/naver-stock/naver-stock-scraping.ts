import fs from "fs";
import { fetchSourceFromurl } from "../scraping";
import cheerio from "cheerio";
import { URLS, Stock, StockType, TradingHistory } from './naver-stock-type';

const stockUrls: URLS = {
    MARKER_LIST:
        "https://finance.naver.com/sise/sise_market_sum.nhn?sosok={type}&page={page}",
    TRADING_TREND:
        "https://finance.naver.com/item/frgn.nhn?code={code}&page={page}",
    DETAIL_PREFIX:
        "https://finance.naver.com",
};

/**
 * Gernerate market page url using type and page number that page has stock list
 * @param type StockType
 * @param page number
 */
const generateMarkerListUrl = (type: StockType, page: number): string => {
    return stockUrls.MARKER_LIST.replace(
        "{type}",
        type === "kospi" ? "0" : "1"
    ).replace("{page}", page.toString());
};

/**
 * Generate trading trend page url that page shows us how much people trade per a day.
 * @param code string stock code
 * @param page number
 */
const generateTradingTrendUrl = (code: string, page: number): string => {
    return stockUrls.TRADING_TREND.replace("{code}", code).replace(
        "{page}",
        page.toString()
    );
};

/**
 * Fetch trading history of the stock
 * @param stockList Stock
 * @param maxPage number if maxPage is defiened, crawling trading trend data till this page
 */
export const fetchTradingHistory = async (
    stock: Stock,
    maxPage: number = 0
): Promise<Array<TradingHistory>> => {
    const tradingHistory: TradingHistory[] = [];

    const code = stock.detailPageUrl.split("=")[1];

    for (let page = 1; page <= maxPage || maxPage === 0; page += 1) {
        const source: string = await fetchSourceFromurl(
            generateTradingTrendUrl(code, page)
        );
        const $: any = cheerio.load(source);

        const tradingTrendTable: any = $("table.type2").get(1);

        $(tradingTrendTable)
            .find("tbody > tr")
            .each((i: number, elem: any) => {
                const tds: any = $(elem).find("td");

                if (tds.length !== 9) {
                    return;
                }

                const institution: number = Number(
                    $(tds).eq(5).find("span").text().replace(/,/g, "")
                );
                const foreigner: number = Number(
                    $(tds).eq(6).find("span").text().replace(/,/g, "")
                );
                let isRise: boolean = false;
                const iconImg = $(tds).eq(2).find("img");
                if (iconImg.html() !== null) {
                    isRise = $(tds).eq(2).find("img").attr("src").indexOf("ico_up") > 0;
                }
                const date = $(tds).eq(0).find("span").text();

                tradingHistory.push({
                    institution,
                    foreigner,
                    isRise,
                    date,
                });
            });
    }

    return tradingHistory;
};

/**
 * Fetch stock list from naver stock site
 * @param type StockType
 */
export const fetchStockList = async (
    type: StockType
): Promise<Array<Stock>> => {
    const stockList: Stock[] = [];

    for (let page = 1; ; page += 1) {
        const source: string = await fetchSourceFromurl(
            generateMarkerListUrl(type, page)
        );
        const $: any = cheerio.load(source);
        const trs = $("table.type_2 > tbody > tr");

        if (trs.length <= 1) {
            break;
        }

        trs.each((i: number, elem: any) => {
            const tds: any = $(elem).find("td");
            const length: number = tds.length;

            if (length !== 13) {
                return;
            }

            const aElem: any = tds.eq(1).find("a");
            if (aElem === undefined) {
                return;
            }

            const newStock: Stock = {
                name: aElem.text(),
                detailPageUrl: stockUrls.DETAIL_PREFIX + aElem.attr("href"),
                stockType: type,
            };
            stockList.push(newStock);
        });
    }

    return stockList;
};
