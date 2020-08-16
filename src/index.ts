import { fetchSource } from './lib/scraping';

fetchSource({ url: 'https://naver.com/', browserMode: true }).then(
  (html: string) => {
    console.log(html);
  }
);
