import { get } from 'svelte/store';
import { config } from '$lib/config';
import { selectedFilters } from '$lib/db';

/** @typedef {import('./types.js').FilterItem} FilterItem */

const PREFIXES = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX lp: <https://w3id.org/lehrplan/ontology/>
PREFIX onto: <http://www.ontotext.com/>
`;

const bundeslandFilter = () => {
	const filter = get(selectedFilters)['states'];
	const filterLen = filter.length;
	if (filterLen === 0) {
		return '?lp lp:LP_0000029 ?bundesland .';
	} else if (filterLen === 1) {
		return `?lp lp:LP_0000029 <${filter[0].uri.value}> .`;
	} else {
		return filter
			.map(
				/** @param {FilterItem} f */
				(f) => `\n{ ?lp lp:LP_0000029 <${f.uri.value}> .}\n`
			)
			.join('\nUNION\n');
	}
};

const subjectsFilter = () => {
	console.log(get(selectedFilters));
	const filter = get(selectedFilters)['subjects'];
	const filterLen = filter.length;
	if (filterLen === 0) {
		return '?lp lp:LP_0000537 ?fach .';
	} else if (filterLen === 1) {
		return `?lp lp:LP_0000537 <${filter[0].uri.value}> .`;
	} else {
		return filter
			.map(
				/** @param {FilterItem} f */
				(f) => `\n{ ?lp lp:LP_0000537 <${f.uri.value}> .}\n`
			)
			.join('\nUNION\n');
	}
};

const jahrgangsstufeFilter = () =>
	/** @type {FilterItem[]} */
	get(selectedFilters)['classLevels'].length
		? get(selectedFilters)
				['jahrgangsstufe'].map(
					/** @param {FilterItem} f */
					(f) => `\n{ ?lp lp:LP_0000026 <${f.uri.value}> .}\n`
				)
				.join('\nUNION\n')
		: '?lp lp:LP_0000026 ?x .';

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
		console.log('result length', data.results.bindings.length);
		return new Response(JSON.stringify(data.results.bindings), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}

export async function queryAllLP() {
	const sparqlQuery = `
${PREFIXES}
select distinct ?s ?lp

where {
  ?s a <https://w3id.org/lehrplan/ontology/LP_0002043> .
  ?s lp:partOf* ?lp .
  }
`;
	console.log(sparqlQuery);
	const result = await executeQuery(sparqlQuery);
	return result;
}

// TODO if search and filters are empty only query Lehrpläne?
export async function queryFTS(search, offset = 0) {
	const sparqlQuery = `
${PREFIXES}
SELECT ?s ?lp
WHERE {
    ?s rdfs:label ?value .
    ${search ? `?value onto:fts "${search}*" .` : ''}
    ?s lp:partOf* ?lp .
    ${bundeslandFilter()}
    ${subjectsFilter()} 
    ${jahrgangsstufeFilter()}

}
OFFSET ${offset}
	`;
	console.log(sparqlQuery);
	const result = await executeQuery(sparqlQuery);
	return result;
}

export async function getSubjectsByState(state) {
	const sparqlQuery = `
${PREFIXES}
SELECT DISTINCT ?uri ?label
WHERE {
    ?s lp:LP_0000537 ?uri .
    ?s lp:LP_0000029 <${state}> .
    ?uri rdfs:label ?label .
}
	`;
	console.log(sparqlQuery);
	const result = await executeQuery(sparqlQuery);
	return result;
}
