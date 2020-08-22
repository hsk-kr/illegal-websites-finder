import axios from 'axios';
import iconv from 'iconv-lite';
import sleep from 'sleep';
import pupeteer from 'puppeteer';
import cheerio from 'cheerio';
import { errorMonitor } from 'stream';

enum GOOGLE_URLS {
  SEARCH = 'https://www.google.com/search?q={q}&start={start}',
}

interface fetchSourceParams {
  url: string;
  encoding?: string;
  browserMode?: boolean;
}

/**
 * Return html source if there is an error, returns ''
 */
export const fetchSource = async ({
  url,
  encoding = 'utf-8',
  browserMode = false,
}: fetchSourceParams): Promise<string> => {
  try {
    // sleep.msleep(50 + Math.round(Math.random() * 100)); // prevent blocking by website
    let ctype: string = '';
    let bHtml: any = null;
    let status: number = -1;

    if (browserMode) {
      const browser: any = await pupeteer.launch();
      const page: any = await browser.newPage();

      const res: any = await page.goto(url);

      bHtml = await res.buffer();
      ctype = res.headers()['content-type'];
      status = Number(res.headers()['status']);

      browser.close();
    } else {
      const res: any = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 1000,
      });

      status = res.status;
      ctype = res.headers['content-type'].toLocaleLowerCase();
      bHtml = res.data;
    }

    if (status === 200) {
      if (ctype.includes(encoding.toLocaleLowerCase())) {
        return iconv.decode(bHtml, encoding);
      }

      return bHtml.toString();
    } else {
      throw new Error(`Response status code: ${status}`);
    }
  } catch (e) {
    console.error(e);
    return '';
  }
};

/**
 * Convert the page to start page number.
 * (page - 1) * 10. It uses to get the google start page number.
 */
const pageToSrtNum = (page: number): number => {
  return (page - 1) * 10;
};

const generateGoogleSearchUrl = (word: string, page: number) => {
  return GOOGLE_URLS.SEARCH.replace('{q}', encodeURI(word)).replace(
    '{page}',
    pageToSrtNum(page).toString()
  );
};

/**
 * Fetch a href links of the google page
 * It removes links that equals '#', relatvie path and google url.
 * IF there is an error, return empty array.
 * @param word
 * @param page
 */
export const fetchGoogleSearchLinks = async (
  word: string,
  page: number
): Promise<Array<string>> => {
  try {
    const url: string = generateGoogleSearchUrl(word, page);
    const html: string = await fetchSource({ url, browserMode: true });

    if (!html) {
      throw new Error('Failed to get html source');
    }

    const $: any = cheerio.load(html);

    const hrefList: Array<string> = [];

    // console.log($('#search .g link'));
    $('#search .g a').each((_: number, elmt: any) => {
      const href: string = $(elmt).attr('href');

      if (href.startsWith('http') && href.indexOf('google.com') === -1) {
        hrefList.push(href);
      }
    });

    return hrefList;
  } catch (e) {
    return [];
  }
};

/**
 * Find links in the website except relative path and partial pages of the website,
 * And return them. If there is an error, return empty array.
 */
export const fetchLinksOfPage = async (url: string): Promise<Array<string>> => {
  try {
    const html: string = await fetchSource({ url, browserMode: true });

    if (!html) {
      throw new Error('Failed to get html source');
    }

    const $: any = cheerio.load(html);
    const hrefList: Array<string> = [];

    // get rootUrl of the page
    let rootUrl = url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const splitUrlBySlash = rootUrl.split('/');

      if (splitUrlBySlash.length >= 3) {
        rootUrl = splitUrlBySlash[2];
      }
    }

    // find links in the page.
    $('a').each((_: number, elmt: any) => {
      const href: string = $(elmt.attr('href'));

      if (href.startsWith('http') && href.indexOf(rootUrl) === -1) {
        hrefList.push(href);
      }
    });

    return hrefList;
  } catch (e) {
    console.error(e);
    return [];
  }
};
