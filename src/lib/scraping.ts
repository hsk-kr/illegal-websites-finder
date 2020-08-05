import axios from "axios";
import iconv from "iconv-lite";
import sleep from "sleep";

/**
 * Return html source if there is an error, returns ''
 * @param url
 */
export const fetchSourceFromurl = async (url: string): Promise<string> => {
  try {
    // sleep.msleep(50 + Math.round(Math.random() * 100)); // prevent blocking by website

    const res: any = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 1000,
    });
    if (res.status === 200) {
      const ctype: string = res.headers["content-type"];

      if (ctype.toLocaleLowerCase().includes("euc-kr")) {
        return iconv.decode(res.data, "euc-kr");
      }

      return res.data;
    } else {
      throw new Error(`Response status code: ${res.status}`);
    }
  } catch (e) {
    console.error(e);
    return "";
  }
};
