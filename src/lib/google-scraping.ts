import { fetchSource } from './scraping';
import cheerio from 'cheerio';

enum GOOGLE_URLS {
  SEARCH = 'https://www.google.com/search?q={q}&start={start}',
}

/**
 *
 * @param page
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
 * @param word
 * @param page
 */
export const fetchGoogleSearchLinks = async (
  word: string,
  page: number
): Promise<Array<string>> => {
  const url: string = generateGoogleSearchUrl(word, page);
  const html: string = await fetchSource({ url, browserMode: true });
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
};
