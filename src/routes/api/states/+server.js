import { config } from '$lib/config';

/** @typedef {import('$lib/types.js').FilterItem} FilterItem */

/**
 * Retrieves URI and label pairs based on optional state filter.
 *
 * @route GET /api/your-endpoint
 * @query {string} [state] - Optional state URI to filter results
 * @return {Promise<FilterItem[]>} Array of objects containing uri and label properties
 * @example
 * // Request: GET /api/your-endpoint?state=http://example.org/states/california
 * // Response:
 * [
 *   { "uri": { "type": "uri", "value": "http://example.org/resource1" },
 *     "label": { "type": "literal", "value": "Resource 1" }
 *   },
 *   { "uri": { "type": "uri", "value": "http://example.org/resource2" },
 *     "label": { "type": "literal", "value": "Resource 2" }
 *   }
 * ]
 *
 * @throws {Error} 500 - If SPARQL query execution fails
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ url }) {
	const state = url.searchParams.get('state');
	const sparqlQuery = `
${config.prefixes}
SELECT DISTINCT ?uri ?label
WHERE {
  ?s lp:LP_0000029 ?uri .
  ?uri rdfs:label ?label .
  ${state ? `?s lp:LP_0000029 <${state}> .` : ''}
  # only german labels
  FILTER(lang(?label) = "de")
}`;
	try {
		const response = await fetch(config.endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/sparql-query',
				Accept: 'application/json'
			},
			body: sparqlQuery
		});

		if (!response.ok) {
			throw new Error('SPARQL query failed');
		}

		const data = await response.json();
		return new Response(JSON.stringify(data.results.bindings), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}
