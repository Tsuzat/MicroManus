import { tool } from 'ai';
import { z } from 'zod';

export const webSearch = tool({
	description:
		"Search the web using Google Search to find current information, news, or context to answer the user's query.",
	inputSchema: z.object({
		query: z.string().describe('The search query to execute')
	}),
	execute: async ({ query }) => {
		const apiKey = process.env.SERP_API_KEY;

		if (!apiKey) {
			return {
				error:
					'SERP_API_KEY is not configured in the environment. Web search is currently unavailable.'
			};
		}

		try {
			const url = new URL('https://serpapi.com/search.json');
			url.searchParams.set('q', query);
			url.searchParams.set('api_key', apiKey);
			url.searchParams.set('engine', 'google');
			url.searchParams.set('num', '5');

			const response = await fetch(url.toString());
			if (!response.ok) {
				throw new Error(`SerpAPI error: ${response.status}`);
			}

			const data = await response.json();

			if (!data.organic_results) {
				return { results: [], message: 'No results found.' };
			}

			const results = data.organic_results.map((result: any, index: number) => ({
				position: index + 1,
				title: result.title,
				url: result.link,
				snippet: result.snippet
			}));

			return { results };
		} catch (error: any) {
			console.error('[WebSearch Tool] Error:', error);
			return {
				error: `Failed to execute search: ${error.message}`
			};
		}
	}
});
