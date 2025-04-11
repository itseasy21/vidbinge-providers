import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 1;
    ctx.progress(progress);
  }, 100);

  let url = `https://2embed.wafflehacker.io/scrape?id=${ctx.media.imdbId}`;
  if (ctx.media.type === 'show') url += `&s=${ctx.media.season.number}&e=${ctx.media.episode.number}`;
  const response = await ctx.fetcher(url);
  ctx.progress(100);

  // CHECKLIST ITEM 3-18: Process response.stream to extract nested URLs
  if (response && Array.isArray(response.stream) && response.stream.length > 0) {
    for (const item of response.stream) {
      if (item && typeof item.playlist === 'string' && item.playlist) {
        try {
          const mainUrl = new URL(item.playlist);
          const firstUrlParam = mainUrl.searchParams.get('url');
          if (firstUrlParam) {
            const firstDecodedUrl = decodeURIComponent(firstUrlParam);
            // Look for &url= first, then ?url=
            let urlParamKeyIndex = firstDecodedUrl.lastIndexOf('&url=');
            if (urlParamKeyIndex === -1) {
              urlParamKeyIndex = firstDecodedUrl.lastIndexOf('?url=');
            }

            if (urlParamKeyIndex !== -1) {
              const secondUrlParam = firstDecodedUrl.substring(urlParamKeyIndex + 5); // Length of "&url=" or "?url="
              const finalUrl = decodeURIComponent(secondUrlParam);
              if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
                item.playlist = finalUrl;
              }
            }
          }
        } catch (error) {
          // Silently ignore parsing errors, keep original playlist URL
          console.error('Error parsing playlist URL in 2embed:', error); // Optional: log for debugging
        }
      }
    }
  }
  // End of added code

  if (response.statusCode === 404) {
    throw new NotFoundError('Movie Not Found');
  }

  if (response) return response as SourcererOutput;

  clearInterval(interval);
  throw new NotFoundError('No data found for this movie');
}

export const twoEmbedScraper = makeSourcerer({
  id: '2embed',
  name: '2Embed',
  rank: 165,
  disabled: false,
  flags: [flags.CORS_ALLOWED],
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
});
