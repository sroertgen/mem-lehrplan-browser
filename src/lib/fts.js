import { writable, get } from 'svelte/store';

import { db } from '$lib/db';

export async function queryFTS(search) {
	const subjectsFilter = get(db).selectedFilters['fach'].length
		? get(db)
				.selectedFilters['fach'].map((f) => `"${f}"`)
				.join(' ')
				.replace(/^/, '{')
				.replace(/$/, '}')
		: 'UNDEF';
	const jahrgangsstufeFilter = get(db).selectedFilters['jahrgangsstufe'].length
		? get(db)
				.selectedFilters['jahrgangsstufe'].map((f) => `"${f}"`)
				.join(' ')
		: '?x';
	const sparqlQuery = `
	PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
	PREFIX lp: <https://w3id.org/lehrplan/ontology/>
	PREFIX onto: <http://www.ontotext.com/>

	SELECT ?s ?value ?fach
	       (GROUP_CONCAT(DISTINCT ?jahrgangsstufe; SEPARATOR=", ") AS ?jahrgangsstufen)
	       (GROUP_CONCAT(DISTINCT ?type; SEPARATOR=", ") AS ?type)
	       (GROUP_CONCAT(DISTINCT ?lp; SEPARATOR=", ") AS ?lehrplaene)
	WHERE {
	    ?s rdfs:label ?value .
	    ?value onto:fts "brot" .
	    ?s lp:partOf* ?lp .
	    ?s a ?type .
	    ?lp lp:hatFach ?fach .
	    ?lp lp:hatJahrgangsstufe ?jahrgangsstufe .

	    VALUES ?fach { ${subjectsFilter} }
      FILTER EXISTS {
        ?lp lp:hatJahrgangsstufe ${jahrgangsstufeFilter}
      }

	}
	GROUP BY ?s ?value ?fach
	ORDER BY ?fach
	LIMIT 100
	`;
	console.log(sparqlQuery);
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
