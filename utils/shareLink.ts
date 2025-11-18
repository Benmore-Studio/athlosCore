import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

const BASE_URL = 'https://athloscore.app';
const SCHEME = 'athloscore://';

export interface ShareLinkOptions {
  type: 'player' | 'game' | 'video' | 'team';
  id: string;
  title?: string;
  message?: string;
}

/**
 * Generate a shareable deep link URL (HTTPS)
 */
export function generateShareLink(options: ShareLinkOptions): string {
  const { type, id } = options;
  return `${BASE_URL}/${type}/${id}`;
}

/**
 * Generate an app-scheme deep link (for internal navigation)
 */
export function generateAppLink(options: ShareLinkOptions): string {
  const { type, id } = options;
  return `${SCHEME}${type}/${id}`;
}

/**
 * Share a link to a player, game, video, or team
 */
export async function shareLink(options: ShareLinkOptions): Promise<boolean> {
  const url = generateShareLink(options);
  const { title, message } = options;
  
  try {
    const result = await Share.share({
      message: message ? `${message}\n\n${url}` : url,
      url: url, // iOS only
      title: title,
    });

    if (result.action === Share.sharedAction) {
      console.log('Content shared successfully');
      return true;
    } else if (result.action === Share.dismissedAction) {
      console.log('Share dismissed');
      return false;
    }
    return false;
  } catch (error) {
    console.error('Error sharing link:', error);
    return false;
  }
}

/**
 * Copy link to clipboard
 */
export async function copyLinkToClipboard(options: ShareLinkOptions): Promise<boolean> {
  const url = generateShareLink(options);
  
  try {
    await Clipboard.setStringAsync(url);
    console.log('Link copied to clipboard:', url);
    return true;
  } catch (error) {
    console.error('Error copying link:', error);
    return false;
  }
}

/**
 * Get link text for displaying
 */
export function getLinkText(options: ShareLinkOptions): string {
  return generateShareLink(options);
}