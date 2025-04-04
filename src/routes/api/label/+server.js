import { config } from '$lib/config';
import { mergeQueryResult } from '$lib/utils';

export async function GET({ fetch, url }) {
	const uri = url.searchParams.get('uri');
	if (!uri) {
		return new Response(JSON.stringify({ error: 'No query provided' }), { status: 400 });
	}

	const sparqlQuery = `
${config.prefixes}
select ?uri ?label 
where {
  <${uri}> rdfs:label ?label .
  BIND (<${uri}> AS ?uri)  
}
  `;
	try {
		console.log(sparqlQuery);
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
		const merged = mergeQueryResult(data.results.bindings);
		return new Response(JSON.stringify(merged), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}
