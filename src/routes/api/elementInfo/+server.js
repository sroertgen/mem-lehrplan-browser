import { config } from '$lib/config';
import { mergeQueryResult } from '$lib/utils';

export async function GET({ fetch, url }) {
	const element = url.searchParams.get('element');
	const lp = url.searchParams.get('lp');
	if (!element) {
		return new Response(JSON.stringify({ error: 'No query provided' }), { status: 400 });
	}

	const sparqlQuery = `
${config.prefixes}
select ?label ?subject ?classLevel ?type ?state
where {
    <${element}> a ?type ;
      rdfs:label ?label .
    OPTIONAL { <${lp}> lp:LP_0000537 ?subject . }
    OPTIONAL { <${lp}> lp:LP_0000026 ?classLevel . }
    OPTIONAL { <${lp}> lp:LP_0000029 ?state . }
.

# only types from lp namespace
FILTER(STRSTARTS(STR(?type), STR(lp:)))
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
