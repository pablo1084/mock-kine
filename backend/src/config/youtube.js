import { DEFAULT_CHANNEL_URL } from '../../supabase/functions/_shared/config.js';

export const youtubeConfig = {
  channelUrl: process.env.YOUTUBE_CHANNEL_URL ?? DEFAULT_CHANNEL_URL,
};
