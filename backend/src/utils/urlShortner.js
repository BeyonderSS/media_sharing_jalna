import axios from 'axios';


/**
 * Shortens a given URL using the spoo.me service.
 * @param {string} originalUrl The URL to shorten.
 * @param {string} [password] Optional password for the shortened URL.
 * @returns {Promise<string>} The shortened URL.
 * @throws {Error} If the API call fails or returns an error.
 */
export const shortenUrl = async (originalUrl, password = null) => {
    try {
        // Validate URL format
        if (!originalUrl || typeof originalUrl !== 'string') {
            throw new Error('Invalid URL provided');
        }

        // Ensure URL is properly formatted
        let urlToShorten = originalUrl.trim();
        if (!urlToShorten.startsWith('http://') && !urlToShorten.startsWith('https://')) {
            throw new Error('URL must start with http:// or https://');
        }

        // Warn if using localhost (URL shortener services cannot access localhost URLs)
        if (urlToShorten.includes('localhost') || urlToShorten.includes('127.0.0.1')) {
            console.warn('Warning: Attempting to shorten a localhost URL. URL shortener services require publicly accessible URLs.');
        }

        const params = new URLSearchParams();
        params.append('url', urlToShorten);
        if (password) {
            params.append('password', password);
        }

        const requestData = params.toString();
        console.log('Shortening URL request:', {
            endpoint: process.env.SHORTNER_ENDPOINT,
            url: urlToShorten,
            hasPassword: !!password
        });

        const response = await axios.post(
            process.env.SHORTNER_ENDPOINT,
            requestData,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        if (response.data && response.data.short_url) {
            return response.data.short_url;
        } else {
            throw new Error('Failed to shorten URL: Invalid response from spoo.me');
        }
    } catch (error) {
        console.error('Error shortening URL:', error.message);
        // Provide more detailed error information if available
        if (error.response) {
            // Log the full error response for debugging
            console.error('API Error Response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: originalUrl
            });
            
            // Extract error message from response
            const errorMessage = error.response.data?.message 
                || error.response.data?.error 
                || JSON.stringify(error.response.data)
                || error.response.statusText 
                || error.message;
            
            throw new Error(`Could not shorten URL: ${errorMessage}`);
        }
        throw new Error(`Could not shorten URL: ${error.message}`);
    }
};

/**
 * Retrieves statistics for a given shortened URL code from the spoo.me service.
 * @param {string} shortCode The short code of the URL (e.g., 'abc123').
 * @param {string} [password] Optional password if the shortened URL is protected.
 * @returns {Promise<object>} An object containing the URL statistics.
 * @throws {Error} If the API call fails or returns an error.
 */
export const getShortUrlStats = async (shortCode, password = null) => {
    try {
        const params = new URLSearchParams();
        if (password) {
            params.append('password', password);
        }

        const response = await axios.post(
            `${process.env.SHORTNER_ENDPOINT}/stats/${shortCode}`,
            params.toString(),
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        if (response.data) {
            return response.data;
        } else {
            throw new Error('Failed to get URL stats: Invalid response from spoo.me');
        }
    } catch (error) {
        console.error(`Error getting stats for short code ${shortCode}:`, error.message);
        // Provide more detailed error information if available
        if (error.response) {
            throw new Error(`Could not retrieve URL stats: ${error.response.data?.message || error.response.statusText || error.message}`);
        }
        throw new Error(`Could not retrieve URL stats: ${error.message}`);
    }
};
