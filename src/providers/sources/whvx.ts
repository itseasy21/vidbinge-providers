import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

export const baseUrl = 'https://fbox-anywhere-457e019579ad.herokuapp.com/https://api.whvx.net';

export const headers = {
  Origin: 'https://www.vidbinge.com',
  Referer: 'https://www.vidbinge.com',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Content-Type': 'application/json',
  Connection: 'keep-alive',
  Pragma: 'no-cache',
  'Cache-Control': 'no-cache',
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
