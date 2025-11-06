import { shortenUrl, getShortUrlStats } from '../utils/urlShortner.js';
import axios from 'axios';

// Mock axios to prevent actual API calls during tests
jest.mock('axios');

describe('URL Shortener Utility', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('shortenUrl', () => {
    test('should return a shortened URL for a valid input', async () => {
      const mockShortUrl = 'https://spoo.me/abc123';
      axios.post.mockResolvedValueOnce({
        data: { short_url: mockShortUrl },
      });

      const originalUrl = 'https://example.com';
      const shortUrl = await shortenUrl(originalUrl);

      expect(shortUrl).toBe(mockShortUrl);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'https://spoo.me',
        'url=https%3A%2F%2Fexample.com',
        expect.any(Object)
      );
    });

    test('should return a shortened URL with a password', async () => {
      const mockShortUrl = 'https://spoo.me/def456';
      axios.post.mockResolvedValueOnce({
        data: { short_url: mockShortUrl },
      });

      const originalUrl = 'https://example.com/secure';
      const password = 'SecurePass123';
      const shortUrl = await shortenUrl(originalUrl, password);

      expect(shortUrl).toBe(mockShortUrl);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'https://spoo.me',
        'url=https%3A%2F%2Fexample.com%2Fsecure&password=SecurePass123',
        expect.any(Object)
      );
    });

    test('should throw an error if API call fails', async () => {
      const errorMessage = 'Network Error';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));

      const originalUrl = 'https://example.com';
      await expect(shortenUrl(originalUrl)).rejects.toThrow(
        `Could not shorten URL: ${errorMessage}`
      );
    });

    test('should throw an error if API response is invalid', async () => {
      axios.post.mockResolvedValueOnce({
        data: { some_other_field: 'value' },
      }); // Missing short_url

      const originalUrl = 'https://example.com';
      await expect(shortenUrl(originalUrl)).rejects.toThrow(
        'Failed to shorten URL: Invalid response from spoo.me'
      );
    });
  });

  describe('getShortUrlStats', () => {
    test('should return URL statistics for a valid short code', async () => {
      const mockStats = {
        _id: 'someId',
        short_code: 'abc123',
        url: 'https://example.com',
        'total-clicks': 10,
      };
      axios.post.mockResolvedValueOnce({
        data: mockStats,
      });

      const shortCode = 'abc123';
      const stats = await getShortUrlStats(shortCode);

      expect(stats).toEqual(mockStats);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'https://spoo.me/stats/abc123',
        '',
        expect.any(Object)
      );
    });

    test('should return URL statistics with a password', async () => {
      const mockStats = {
        _id: 'someId',
        short_code: 'def456',
        url: 'https://example.com/secure',
        'total-clicks': 5,
      };
      axios.post.mockResolvedValueOnce({
        data: mockStats,
      });

      const shortCode = 'def456';
      const password = 'SecurePass123';
      const stats = await getShortUrlStats(shortCode, password);

      expect(stats).toEqual(mockStats);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'https://spoo.me/stats/def456',
        'password=SecurePass123',
        expect.any(Object)
      );
    });

    test('should throw an error if API call fails', async () => {
      const errorMessage = 'Request failed with status code 404';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));

      const shortCode = 'nonexistent';
      await expect(getShortUrlStats(shortCode)).rejects.toThrow(
        `Could not retrieve URL stats: ${errorMessage}`
      );
    });

    test('should throw an error if API response is invalid', async () => {
      axios.post.mockResolvedValueOnce({
        data: null,
      }); // Empty data

      const shortCode = 'abc123';
      await expect(getShortUrlStats(shortCode)).rejects.toThrow(
        'Failed to get URL stats: Invalid response from spoo.me'
      );
    });
  });
});