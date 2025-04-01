import { config } from '$lib/config';
import { mergeQueryResult } from '$lib/utils';

export async function GET({ url }) {
	const subject = url.searchParams.get('subject');
	const lp = url.searchParams.get('lp');
	if (!subject) {
		return new Response(JSON.stringify({ error: 'No query provided' }), { status: 400 });
	}

	const sparqlQuery = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX lp: <https://w3id.org/lehrplan/ontology/>
PREFIX onto: <http://www.ontotext.com/>

select ?label ?subject ?classLevel ?type
where {
    <${subject}> a ?type ;
      rdfs:label ?label .
    <${lp}> lp:LP_0000537 ?subject ;
            lp:LP_0000026 ?classLevel .

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
		console.log('data', data);
		const merged = mergeQueryResult(data.results.bindings);
		return new Response(JSON.stringify(merged), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}
