import { config } from '$lib/config';

const PREFIXES = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX lp: <https://w3id.org/lehrplan/ontology/>
PREFIX onto: <http://www.ontotext.com/>
`;

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
${PREFIXES}
SELECT DISTINCT ?uri ?label
WHERE {
  ?s lp:LP_0000537 ?uri .
  ${state ? `?s lp:LP_0000029 <${state}> .` : ''}
  ?uri rdfs:label ?label .
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
