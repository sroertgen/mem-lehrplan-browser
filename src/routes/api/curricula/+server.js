import { config } from '$lib/config';

/**
 * Retrieves URI and label pairs based on optional state filter.
 *
 * @route GET /api/your-endpoint
 * @query {string} [state] - Optional state URI to filter results
 * @query {string} [limit] - Optional limit parameter to limit results
 * @example
 *
 * @throws {Error} 500 - If SPARQL query execution fails
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ url }) {
	const state = url.searchParams.get('state');
	const limit = url.searchParams.get('limit');
	const sparqlQuery = `
${config.prefixes}
SELECT DISTINCT ?s ?lp

WHERE {
  ?s a <https://w3id.org/lehrplan/ontology/LP_0000438> .
  ${state ? `?s lp:LP_0000029 <${state}> .` : ''}
  BIND (?s AS ?lp)
}

${limit ? `LIMIT ${limit}` : ''}

`;
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
