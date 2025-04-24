import { browser } from '$app/environment';
import { writable, get, derived } from 'svelte/store';
import { config, uriMappings } from '$lib/config';
import { buildTreeFromSparqlResults, getElementInfo, mergeQueryResult } from './utils.js';

/**
 * @typedef {import('svelte/store').Readable} Readable
 * @typedef {import('svelte/store').Readable<boolean>} ReadableBoolean
 * @typedef {import('./types.js').FilterItem} FilterItem
 */

export const searchTerm = writable('');
export const currentPage = writable(0);
export const filters = writable(initFilters());
export const selectedFilters = writable(initSelectedFilters());
export const uri2label = writable({});
/** @type {ReadableBoolean} */
const filterIsSelected = derived(selectedFilters, ($selectedFilters) => {
	const someSelected = Boolean(Object.values($selectedFilters).flat().length);
	return someSelected;
});
export const totalResults = writable(0);
export const sideBarFilterOpen = writable(false);
export const sideBarElementOpen = writable(false);
export const selectedElements = writable([]);
export const results = writable([]);
export const resultCounter = writable({});
export const selectedElementsAsTree = writable([]);

export const db = writable({
	results: [],
	resultsPerPage: 10
});

export function getDB() {
	return get(db);
}

function sortItems(items) {
	const sortedFilterItems = items.sort((a, b) =>
		a.label.value.localeCompare(b.label.value, 'de', { sensitivity: 'base' })
	);
	return sortedFilterItems;
}

async function initFilters() {
	if (!browser) return;
	const subjectsRes = await fetch('/api/subjects');
	const subjects = await subjectsRes.json();

	const classLevelsRes = await fetch('/api/classLevels');
	const classLevels = await classLevelsRes.json();
	const classLevelsSorted = sortItems(classLevels);

	const statesRes = await fetch('/api/states');
	const states = await statesRes.json();

	const subjectByStatePromises = states.map(async (e) => {
		const response = await fetch(`/api/subjects?state=${e.uri.value}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return { [e.uri.value]: await response.json() }; // state uri: Subjects as FilterItems
	});
	const subjectsByStateArray = await Promise.all(subjectByStatePromises);
	const subjectsByState = subjectsByStateArray.reduce((accumulator, currentObj) => {
		return { ...accumulator, ...currentObj };
	}, {});
	let subjectsSorted = {};
	Object.keys(subjectsByState).map((k) => (subjectsSorted[k] = sortItems(subjectsByState[k])));

	const types = {
		'https://w3id.org/lehrplan/ontology/LP_3000051': [
			{
				uri: { type: 'uri', value: 'https://w3id.org/lehrplan/ontology/LP_0000819' },
				label: { type: 'literal', value: 'Lehrplan Plus (BY)' }
			}
		]
	};

	const schoolTypesRes = await fetch('/api/schoolTypes');
	const schoolTypes = await schoolTypesRes.json();
	const schoolTypesSorted = sortItems(schoolTypes);

	const labels = Object.assign(
		{},
		...[
			subjects.map((e) => ({ [e.uri.value]: e.label.value })),
			classLevels.map((e) => ({ [e.uri.value]: e.label.value })),
			states.map((e) => ({ [e.uri.value]: e.label.value }))
		].flat()
	);

	// store the labels
	uri2label.update((uri2label) => {
		return { ...labels, ...uriMappings };
	});

	filters.update((filters) => {
		return {
			types,
			states,
			subjects,
			classLevels: classLevelsSorted,
			subjectsByState: subjectsSorted,
			schoolTypes: schoolTypesSorted
		};
	});
}

function initSelectedFilters() {
	return Object.fromEntries(config.filterKeys.map((e) => [e, []]));
}

export function toggleElement(uri) {
	selectedElements.update((se) => {
		if (se.find((e) => e === uri)) {
			return se.filter((e) => e !== uri);
		} else {
			return [...se, uri];
		}
	});
}

/**
 * @param {string} key
 * @param {FilterItem} val
 */
export function toggleFilter(key, val) {
	selectedFilters.update((sf) => {
		const current = sf || {};
		const currentValues = current[key] || [];

		if (currentValues.find((e) => e.uri.value === val.uri.value)) {
			return {
				...current,
				[key]: currentValues.filter((f) => f.uri.value !== val.uri.value)
			};
		} else {
			return {
				...current,
				[key]: [...currentValues, val]
			};
		}
	});
	currentPage.set(0);
	handleQuery();
}

// Helper function to build params
function buildParams(
	offset,
	searchVal,
	selectedStates,
	selectedSubjects,
	selectedLevels,
	selectedTypes,
	selectedSchoolTypes,
	element = null
) {
	const params = new URLSearchParams();

	if (offset) {
		params.append('offset', offset);
	}
	if (searchVal) {
		params.append('search', searchVal);
	}
	if (selectedStates) {
		selectedStates.forEach((e) => params.append('state', e.uri.value));
	}
	if (selectedSubjects) {
		selectedSubjects.forEach((e) => params.append('subject', e.uri.value));
	}
	if (selectedLevels) {
		selectedLevels.forEach((e) => params.append('level', e.uri.value));
	}
	if (selectedTypes) {
		selectedTypes.forEach((e) => params.append('type', e.uri.value));
	}
	if (selectedSchoolTypes) {
		selectedSchoolTypes.forEach((e) => params.append('schoolType', e.uri.value));
	}

	if (element) {
		params.append('element', element);
		params.append('recursive', 'true');
	}

	return params;
}

export async function handleQuery() {
	if (!browser) return;
	try {
		const selectedFiltersStore = get(selectedFilters);
		const offset = get(currentPage) * get(db).resultsPerPage;
		const searchVal = get(searchTerm);
		const selectedStates = selectedFiltersStore['states'];
		const selectedSubjects = selectedFiltersStore['subjects'];
		const selectedLevels = selectedFiltersStore['classLevels'];
		const selectedTypes = selectedFiltersStore['types'];
		const selectedSchoolTypes = selectedFiltersStore['schoolTypes'];
		const selectedElementsStore = get(selectedElements);

		let resultsNew = [];

		if (searchVal || get(filterIsSelected)) {
			let fetchPromises = [];

			if (selectedElementsStore.length > 0) {
				fetchPromises = selectedElementsStore.map((element) => {
					const params = buildParams(
						offset,
						searchVal,
						selectedStates,
						selectedSubjects,
						selectedLevels,
						selectedTypes,
						selectedSchoolTypes,
						element
					);
					const url = `/api/query?${params.toString()}`;
					console.log('url', url);
					return fetch(url).then((res) => res.json());
				});
			} else {
				// No elements selected
				const params = buildParams(
					offset,
					searchVal,
					selectedStates,
					selectedSubjects,
					selectedLevels,
					selectedTypes,
					selectedSchoolTypes
				);
				const url = `/api/query?${params.toString()}`;
				fetchPromises.push(fetch(url).then((res) => res.json()));
			}

			const resultsArrays = await Promise.all(fetchPromises);
			// TODO merge results
			resultsNew = resultsArrays.flat();
			console.log(mergeQueryResult(resultsNew));
			// resultsNew = mergeQueryResult(resultsNew);
		} else {
			// Default query with no filters
			const res = await fetch('/api/curricula');
			resultsNew = await res.json();
		}

		if (get(currentPage) === 0) {
			totalResults.set(resultsNew.length);
		}

		results.set(resultsNew);
	} catch (error) {
		console.error('Error fetching results:', error);
	}
}

// Handle Query after button click
currentPage.subscribe(() => {
	handleQuery();
});

// results.subscribe(async () => {
// 	get(results).forEach(async (e) => await getElementInfo(e.s.value));
// });

export const resetFilters = () => {
	searchTerm.set('');
	selectedFilters.set(initSelectedFilters());
	db.update((db) => ({ ...db, results: [] }));
	handleQuery();
};

/**
 * Looks a label up in the uri2label store
 * if not found it searches for it and adds it to the store
 * @param {string} uri - The uri to look up
 * @returns {Promise<string>}
 */
export async function lookupLabel(uri) {
	const labelStore = get(uri2label);
	const label = labelStore[uri] ?? null;
	if (label) {
		return label;
	} else {
		const res = await fetch(`/api/label?uri=${uri}`);
		const labelRes = await res.json();
		const label = labelRes.label?.[0].value ?? uri;
		// initialize uri2label if empty
		if (Object.keys(labelStore).length === 0) {
			// TODO make dedicated uri2label initializer
			await initFilters();
			return lookupLabel(uri);
		}
		uri2label.update((uri2label) => {
			return {
				...uri2label,
				[uri]: label
			};
		});
		return label;
	}
}

export async function getChildren(uri) {
	const hasPartInfoRes = await fetch(`/api/hasParts?element=${uri}`);
	const hasPartInfo = await hasPartInfoRes.json();
	const children = hasPartInfo.map((e) => e.child.value);
	return children;
}
