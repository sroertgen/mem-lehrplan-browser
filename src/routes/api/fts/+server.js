import { getDB } from '$lib/db';

export async function GET({ url }) {
	console.log('handling query');
	const search = url.searchParams.get('query');
	if (!search) {
		return new Response(JSON.stringify({ error: 'No query provided' }), { status: 400 });
	}
	const db = getDB();
	console.log('db in server.js', db);
	const subjectsFilter = db.selectedFilters['fach'].length
		? db.selectedFilters['fach'].join(' ') // Inject provided subjects
		: 'UNDEF'; // If no subjects provided, allow all
	console.log(db.selectedFilters['fach']);
	console.log(subjectsFilter);
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
}
GROUP BY ?s ?value ?fach
ORDER BY ?fach
LIMIT 100
`;
	console.log(sparqlQuery);
	// 	const sparqlQuery = `
	// PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
	// PREFIX lp: <https://w3id.org/lehrplan/ontology/>
	// PREFIX onto: <http://www.ontotext.com/>

	// SELECT ?s ?value ?fach
	//        (GROUP_CONCAT(DISTINCT ?jahrgangsstufe; SEPARATOR=", ") AS ?jahrgangsstufen)
	//        (GROUP_CONCAT(DISTINCT ?type; SEPARATOR=", ") AS ?type)
	//        (GROUP_CONCAT(DISTINCT ?lp; SEPARATOR=", ") AS ?lehrplaene)
	// WHERE {
	//     ?s rdfs:label ?value .
	//     ?value onto:fts "brot" .
	//     ?s lp:partOf* ?lp .
	//     ?s a ?type .
	//     ?lp lp:hatFach ?fach .
	//     ?lp lp:hatJahrgangsstufe ?jahrgangsstufe .
	// }
	// GROUP BY ?s ?value ?fach
	// ORDER BY ?fach
	// LIMIT 100
	// `;
	// const sparqlQuery = `
	//    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
	//    PREFIX lp: <https://w3id.org/lehrplan/ontology/>
	//    PREFIX onto: <http://www.ontotext.com/>

	//    SELECT * WHERE {
	//      ?s rdfs:label ?value .
	//      ?value onto:fts "${search}*" .
	//      ?s a ?type .
	//    } LIMIT 100
	//  `;

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
