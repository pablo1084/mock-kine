import { createPublicApi } from '../_shared/public-api.mjs';
import { DEFAULT_CHANNEL_URL } from '../_shared/config.js';

Deno.serve(createPublicApi({
  channelUrl: Deno.env.get('YOUTUBE_CHANNEL_URL') ?? DEFAULT_CHANNEL_URL,
}));
