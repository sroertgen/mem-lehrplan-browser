import { config } from '$lib/config';

const PREFIXES = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX lp: <https://w3id.org/lehrplan/ontology/>
PREFIX onto: <http://www.ontotext.com/>
`;

export async function GET({ url }) {
	const filter = url.searchParams.get('filter');
	if (!filter) {
		return new Response(JSON.stringify({ error: 'No query provided' }), { status: 400 });
	}

	const sparqlQuery = {
		fach: `
${PREFIXES}
SELECT DISTINCT ?uri ?label
WHERE {
    ?s lp:LP_0000537 ?uri .
    ?uri rdfs:label ?label .
}
`,
		jahrgangsstufe: `
${PREFIXES}
SELECT DISTINCT ?uri ?label
WHERE {
    ?s lp:LP_0000026 ?uri .
    ?uri rdfs:label ?label .
    # only german labels    
    FILTER(lang(?label) = "de")
}
`,
		bundesland: `
${PREFIXES}
SELECT DISTINCT ?uri ?label
WHERE {
    ?s lp:LP_0000029 ?uri .
    ?uri rdfs:label ?label .
    

    FILTER(lang(?label) = "de")
}
`
	};

	try {
		const response = await fetch(config.endpoint, {
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
