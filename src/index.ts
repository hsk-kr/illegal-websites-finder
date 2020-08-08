import { fetchSource } from "./lib/scraping";

fetchSource("https://google.com/").then((html: string) => {
  console.log(html);
});
