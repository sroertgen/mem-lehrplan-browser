import { config } from '$lib/config';

export async function GET({ fetch, url }) {
	const element = url.searchParams.get('element');
	if (!element) {
		return new Response(JSON.stringify({ error: 'No query provided' }), { status: 400 });
	}

	// TODO lp entfernen und über query bekommen.
	const sparqlQuery = `
${config.prefixes}
SELECT DISTINCT ?child
WHERE {
  <${element}> lp:hasPart ?child .
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
		return new Response(JSON.stringify(data.results.bindings), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}
