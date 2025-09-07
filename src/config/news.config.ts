export const NEWS_CONFIG = {
  apiKey: '468f5f905b9848ce925013882c185483',
  baseUrl: 'https://newsapi.org/v2',
  defaultParams: {
    language: 'en',
    pageSize: 12,
    country: 'in', // Added country parameter for India
    q: 'agriculture OR farming OR crops OR "agricultural technology"',
  }
};