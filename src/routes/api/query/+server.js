import { config } from '$lib/config';
import { statesFilter, subjectsFilter, classLevelFilter } from '$lib/queryBuilder';

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
	const search = url.searchParams.get('search');
	const states = url.searchParams.getAll('state');
	const levels = url.searchParams.getAll('level');
	const subjects = url.searchParams.getAll('subject');
	const limit = url.searchParams.get('limit');
	const offset = url.searchParams.get('offset');
	const sparqlQuery = `

${config.prefixes}
SELECT ?s ?lp
WHERE {
  ?s rdfs:label ?value .
  ${search ? `?value onto:fts "${search}*" .` : ''}
  ?s lp:partOf* ?lp .
  ${statesFilter(states)}
  ${subjectsFilter(subjects)} 
  ${classLevelFilter(levels)}
}

${limit ? `LIMIT ${limit}` : ''}
${offset ? `OFFSET ${offset}` : ''}
`;
	console.log(sparqlQuery);
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
