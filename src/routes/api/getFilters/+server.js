export async function GET({ url }) {
	const filter = url.searchParams.get('filter');
	if (!filter) {
		return new Response(JSON.stringify({ error: 'No query provided' }), { status: 400 });
	}

	const sparqlQuery = {
		fach: `
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX lp: <https://w3id.org/lehrplan/ontology/>
          PREFIX onto: <http://www.ontotext.com/>

          SELECT DISTINCT ?fach
          WHERE {
              ?s lp:hatFach ?fach .
          }
  `,
		jahrgangsstufe: `
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX lp: <https://w3id.org/lehrplan/ontology/>
          PREFIX onto: <http://www.ontotext.com/>

          SELECT DISTINCT ?jahrgangsstufe
          WHERE {
              ?s lp:hatJahrgangsstufe ?jahrgangsstufe .
          }
  `
	};

	const endpoint = 'http://localhost:7200/repositories/bayern';

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/sparql-query',
				Accept: 'application/json'
			},
			body: sparqlQuery[filter]
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
