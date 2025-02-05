export async function GET({ url }) {
	const subject = url.searchParams.get('subject');
	if (!subject) {
		return new Response(JSON.stringify({ error: 'No query provided' }), { status: 400 });
	}

	const sparqlQuery = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX lp: <https://w3id.org/lehrplan/ontology/>
    PREFIX onto: <http://www.ontotext.com/>

    select * where {
    <${subject}> ?p ?o  .
    } limit 100
  `;

	const endpoint = 'http://localhost:7200/repositories/bayern';

	try {
		const response = await fetch(endpoint, {
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
