/**
 * Telegram bot links for different languages/regions
 * Only add language if it has a different bot link than English
 * If language is not specified, it will use English bot link as default
 */
export const telegramBotLinks: Record<string, string> = {
  en: "https://t.me/flowers_auth_bot", // English (default)
  hi: "https://t.me/flowers_auth_hi_bot?start=flowarshi", // Hindi
};

/**
 * Telegram channel links for different languages/regions
 * Only add language if it has a different channel link than English
 * If language is not specified, it will use English channel link as default
 */
export const telegramChannelLinks: Record<string, string> = {
  en: "https://t.me/+jurWswcfvY4xODEy", // English (default)
};

/**
 * Get Telegram bot link for the specified language
 * Falls back to English if language not found
 */
export const getTelegramBotLink = (language: string): string => {
  return telegramBotLinks[language] || telegramBotLinks.en;
};

/**
 * Get Telegram channel link for the specified language
 * Falls back to English if language not found
 */
export const getTelegramChannelLink = (language: string): string => {
  return telegramChannelLinks[language] || telegramChannelLinks.en;
};
