import axios from "axios";
import iconv from "iconv-lite";
import sleep from "sleep";

/**
 * Return html source if there is an error, returns ''
 * @param url
 */
export const fetchSource = async (
  url: string,
  encoding = "utf-8"
): Promise<string> => {
  try {
    // sleep.msleep(50 + Math.round(Math.random() * 100)); // prevent blocking by website

    const res: any = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 1000,
    });
    if (res.status === 200) {
      const ctype: string = res.headers["content-type"];

      if (ctype.toLocaleLowerCase().includes(encoding)) {
        return iconv.decode(res.data, encoding);
      }
      console.log("here");
      return res.data.toString();
    } else {
      throw new Error(`Response status code: ${res.status}`);
    }
  } catch (e) {
    console.error(e);
    return "";
  }
};
