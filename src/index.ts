import { fetchGoogleSearchLinks } from './lib/scraping';

const main = async () => {
  const links: Array<string> = await fetchGoogleSearchLinks('test', 1);

  console.log(links);
};

main().then(() => {
  console.log('done');
});
