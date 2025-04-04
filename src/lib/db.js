import { browser } from '$app/environment';
import { writable, get, derived } from 'svelte/store';
import { config } from '$lib/config';

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
export const sideBarOpen = writable(false);

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
		return labels;
	});

	filters.update((filters) => {
		return {
			states,
			subjects,
			classLevels: classLevelsSorted,
			subjectsByState
		};
	});
}

function initSelectedFilters() {
	return Object.fromEntries(config.filterKeys.map((e) => [e, []]));
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

export async function handleQuery() {
	if (!browser) return;
	try {
		const selectedFiltersStore = get(selectedFilters);
		const offset = get(currentPage) * get(db).resultsPerPage;
		const searchVal = get(searchTerm);
		const selectedStates = selectedFiltersStore['states'];
		const selectedSubjects = selectedFiltersStore['subjects'];
		const selectedLevels = selectedFiltersStore['classLevels'];
		let res;
		if (searchVal || get(filterIsSelected)) {
			const params = new URLSearchParams();
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
			const url = `/api/query?${params.toString()}`;
			res = await fetch(url);
		} else {
			res = await fetch('/api/curricula');
		}
		const results = await res.json();

		if (get(currentPage) === 0) {
			totalResults.set(results.length);
		}

		db.update((db) => {
			return { ...db, results };
		});
	} catch (error) {
		console.error('Error fetching results:', error);
	}
}

// Handle Query after button click
currentPage.subscribe(() => {
	handleQuery();
});

export const resetFilters = () => {
	searchTerm.set('');
	selectedFilters.set(initSelectedFilters());
	db.update((db) => ({ ...db, results: [] }));
	handleQuery();
};

export async function lookupLabel(uri) {
	const res = await fetch(`/api/label?label=${uri}`);
	const labelRes = await res.json();
	const label = labelRes.label.value;
	console.log('looked up label', label);
	return;
}
