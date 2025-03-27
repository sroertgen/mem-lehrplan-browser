import { writable, get } from 'svelte/store';
import { config } from '$lib/config';
import { db, selectedFilters } from '$lib/db';

/** @typedef {import('./types.js').FilterItem} FilterItem */

const PREFIXES = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX lp: <https://w3id.org/lehrplan/ontology/>
PREFIX onto: <http://www.ontotext.com/>
`;

const subjectsFilter = () =>
	get(selectedFilters)['fach'].length
		? get(selectedFilters)
				['fach'].map(
					/** @param {FilterItem} f */
					(f) => `<${f.uri.value}>`
				)
				.join(' ')
		: '?y';

const jahrgangsstufeFilter = () =>
	/** @type {FilterItem[]} */
	get(selectedFilters)['jahrgangsstufe'].length
		? get(selectedFilters)
				['jahrgangsstufe'].map(
					/** @param {FilterItem} f */
					(f) => `<${f.uri.value}>`
				)
				.join(', ')
		: '?x';

const bundeslandFilter = () => {};

const filterQuery = () => `
#VALUES ?fach { ${subjectsFilter()} }
FILTER(lang(?jahrgangsstufeLabel) = "de")
FILTER EXISTS {
  ?lp lp:LP_0000026 ${jahrgangsstufeFilter()} .
}
`;

async function executeQuery(sparqlQuery) {
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

export async function queryAllLP(offset = 0) {
	const sparqlQuery = `
${PREFIXES}
select distinct ?s ?value ?fach ?fachLabel ?jahrgangsstufeLabel
(GROUP_CONCAT(DISTINCT ?jahrgangsstufeLabel; SEPARATOR=", ") AS ?jahrgangsstufenLabels)
(GROUP_CONCAT(DISTINCT ?type; SEPARATOR=", ") AS ?type)

where {
  ?s a <https://w3id.org/lehrplan/ontology/LP_0002043> ;
    a ?type ;
    rdfs:label ?value ;
    lp:LP_0000026 ?jahrgangsstufe ;
    lp:LP_0000537 ?fach ; 
    lp:LP_0000812 ?schulart .
  ?fach rdfs:label ?fachLabel .
  ?jahrgangsstufe rdfs:label ?jahrgangsstufeLabel .

    ${filterQuery()}

  }
GROUP BY ?fachLabel ?fach ?jahrgangsstufeLabel ?value ?s 
ORDER BY ASC(?fachLabel)
LIMIT 10
OFFSET ${offset}

`;
	console.log(sparqlQuery);
	const result = await executeQuery(sparqlQuery);
	return result;
}

export async function queryFTS(search) {
	const sparqlQuery = `
${PREFIXES}
SELECT ?s ?value ?fach
       (GROUP_CONCAT(DISTINCT ?jahrgangsstufe; SEPARATOR=", ") AS ?jahrgangsstufen)
       (GROUP_CONCAT(DISTINCT ?type; SEPARATOR=", ") AS ?type)
       (GROUP_CONCAT(DISTINCT ?lp; SEPARATOR=", ") AS ?lehrplaene)
WHERE {
    ?s rdfs:label ?value .
    ?value onto:fts \"${search}*\" .
    ?s lp:partOf* ?lp .
    ?s a ?type .

    VALUES ?fach { ${subjectsFilter()} }
    FILTER EXISTS {
      ?lp lp:LP_0000026 ${jahrgangsstufeFilter()}
    }

}
GROUP BY ?s ?value ?fach
ORDER BY ?fach
# LIMIT100
	`;
	console.log(sparqlQuery);
	const result = await executeQuery(sparqlQuery);
	return result;
}
