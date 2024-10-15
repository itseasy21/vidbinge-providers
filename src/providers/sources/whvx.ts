import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

export const baseUrl = 'https://api.whvx.net';

export const headers = {
  ':authority': 'api.whvx.net',
  ':method': 'GET',
  ':path': '/status',
  ':scheme': 'https',
  accept: '*/*',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'en-US,en;q=0.9',
  'cache-control': 'no-cache',
  origin: 'https://www.vidbinge.com',
  pragma: 'no-cache',
  priority: 'u=1, i',
  'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
};

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  const query = {
    title: ctx.media.title,
    releaseYear: ctx.media.releaseYear,
    tmdbId: ctx.media.tmdbId,
    imdbId: ctx.media.imdbId,
    type: ctx.media.type,
    season: '',
    episode: '',
  };

  if (ctx.media.type === 'show') {
    query.season = ctx.media.season.number.toString();
    query.episode = ctx.media.episode.number.toString();
  }

  const res = await ctx.fetcher(`${baseUrl}/status`, {
    headers,
  });

  if (res.providers?.length === 0) {
    throw new NotFoundError('No providers available');
  }

  const embeds = res.providers.map((provider: string) => {
    return {
      embedId: provider,
      url: JSON.stringify(query),
    };
  });

  return {
    embeds,
  };
}

export const whvxScraper = makeSourcerer({
  id: 'whvx',
  name: 'WHVX',
  rank: 160,
  flags: [flags.CORS_ALLOWED],
  disabled: false,
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
});
