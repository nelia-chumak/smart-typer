import axios from 'axios';
import { Knex } from 'knex';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function checkExists(url: string): Promise<boolean> {
  const u = url.endsWith('/') ? url : url + '/';
  try {
    await axios.get<string>(u, {
      responseType: 'text',
      headers: {
        'User-Agent': UA,
        Referer: 'https://wordfinder.yourdictionary.com/',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
      maxRedirects: 5,
      timeout: 15000,
      validateStatus: (s) => s === 200,
    });
    return true;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return false;
    }
    throw e;
  }
}

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

async function getSkills(): Promise<string[]> {
  const alphabet = [...'abcdefghijklmnopqrstuvwxyz'];
  const result: string[] = [];

  for (const a of alphabet) {
    for (const b of alphabet) {
      const pair = `${a}${b}`;
      console.log(pair);
      const url = `https://wordfinder.yourdictionary.com/words-with-the-letter/${pair}`;
      const ok = await checkExists(url);
      if (ok) result.push(pair);
      await sleep(250);
    }
  }
  return result;
}

export async function seed(knex: Knex): Promise<void> {
  const skills = await getSkills();
  if (!skills.length) return;

  await knex('skills')
    .insert(skills.map((name) => ({ name })))
    .onConflict('name')
    .ignore();
}
