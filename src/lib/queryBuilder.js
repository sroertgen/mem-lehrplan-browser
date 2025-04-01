import { writable, get } from 'svelte/store';
import { config } from '$lib/config';
import { db, selectedFilters } from '$lib/db';

/** @typedef {import('./types.js').FilterItem} FilterItem */

const PREFIXES = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX lp: <https://w3id.org/lehrplan/ontology/>
PREFIX onto: <http://www.ontotext.com/>
`;

const subjectsFilter = () => {
	const filter = get(selectedFilters)['fach'];
	const filterLen = filter.length;
	if (filterLen === 0) {
		return '?lp lp:LP_0000537 ?fach .';
	} else if (filterLen === 1) {
		return `?lp lp:LP_0000537 <${filter[0].uri.value}> .`;
	} else {
		filter
			.map(
				/** @param {FilterItem} f */
				(f) => `\n{ ?lp lp:LP_0000537 <${f.uri.value}> .}\n`
			)
			.join('\nUNION\n');
	}
};

const jahrgangsstufeFilter = () =>
	/** @type {FilterItem[]} */
	get(selectedFilters)['jahrgangsstufe'].length
		? get(selectedFilters)
				['jahrgangsstufe'].map(
					/** @param {FilterItem} f */
					(f) => `\n{ ?lp lp:LP_0000026 <${f.uri.value}> .}\n`
				)
				.join('\nUNION\n')
		: '?lp lp:LP_0000026 ?x .';

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
select distinct ?s ?lp

where {
  ?s a <https://w3id.org/lehrplan/ontology/LP_0002043> .
  ?s lp:partOf* ?lp .
  }
LIMIT 10
OFFSET ${offset}
`;
	console.log(sparqlQuery);
	const result = await executeQuery(sparqlQuery);
	return result;
}

export async function queryFTS(search, offset = 0) {
	const sparqlQuery = `
${PREFIXES}
SELECT ?s ?lp
WHERE {
    ?s rdfs:label ?value .
    ${search ? `?value onto:fts "${search}*" .` : ''}
    ?s lp:partOf* ?lp .
    ${subjectsFilter()} 
    ${jahrgangsstufeFilter()}

}
LIMIT 10
OFFSET ${offset}
	`;
	console.log(sparqlQuery);
	const result = await executeQuery(sparqlQuery);
	return result;
}
