import axios from 'axios';
import iconv from 'iconv-lite';
import sleep from 'sleep';
import pupeteer from 'puppeteer';

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
