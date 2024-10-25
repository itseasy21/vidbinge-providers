import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';

export const baseUrl = 'https://fbox-anywhere-457e019579ad.herokuapp.com/https://mirrors.whvx.net/';

export const headers = {
  Accept: '*/*',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Accept-Language': 'en-US,en;q=0.9',
  Origin: 'https://www.vidbinge.com',
  'User-Agent':
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

  const data = {
    providers: ['amzn', 'ntflx'],
  };

  const embeds = data.providers.map((provider: string) => {
    return {
      embedId: provider,
      url: JSON.stringify(query),
    };
  });

  return {
    embeds,
  };
}

export const mirrorsScraper = makeSourcerer({
  id: 'whvxMirrors',
  name: 'WHVX Mirrors',
  rank: 158,
  flags: [flags.CORS_ALLOWED],
  disabled: false,
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
});
