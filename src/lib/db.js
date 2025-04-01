import { writable, get, derived } from 'svelte/store';
import { config } from '$lib/config';
import { queryFTS, queryAllLP } from '$lib/queryBuilder';

/**
 * @typedef {import('svelte/store').Readable} Readable
 * @typedef {import('svelte/store').Readable<boolean>} ReadableBoolean
 * @typedef {import('./types.js').FilterItem} FilterItem
 */

export const searchTerm = writable('');
export const currentPage = writable(0);
export const filters = writable([]);
initFilters();
export const selectedFilters = writable(initSelectedFilters());
export const uri2label = writable({});
/** @type {ReadableBoolean} */
const filterIsSelected = derived(selectedFilters, ($selectedFilters) => {
	const someSelected = Boolean(Object.values($selectedFilters).flat().length);
	return someSelected;
});

export const db = writable({
	results: [],
	resultsPerPage: 10
});

export function getDB() {
	return get(db);
}

async function getFilter(filterQuery, filterLabel) {
	const faecherRaw = await fetch(`/api/getFilters?filter=${filterQuery}`);

	/**
	 * List of subjects/categories fetched from the API
	 * @type {FilterItem[]}
	 */
	const filterItems = await faecherRaw.json();
	const sortedFilterItems = filterItems.sort((a, b) =>
		a.label.value.localeCompare(b.label.value, 'de', { sensitivity: 'base' })
	);
	const filter = [filterLabel, sortedFilterItems];
	return filter;
}

async function initFilters() {
	const filtersToGet = ['fach', 'jahrgangsstufe', 'bundesland'];

	const filterPromises = filtersToGet.map(async (filterType) => {
		return await getFilter(filterType, filterType);
	});

	const [faecher, jahrgangsstufe, bundesland] = await Promise.all(filterPromises);

	uri2label.update((uri2label) => {
		return Object.assign(
			{},
			...[
				...faecher[1].map((e) => ({ [e.uri.value]: e.label.value })),
				...jahrgangsstufe[1].map((e) => ({ [e.uri.value]: e.label.value })),
				...bundesland[1].map((e) => ({ [e.uri.value]: e.label.value }))
			].flat()
		);
	});

	filters.update((filters) => {
		return [bundesland, faecher, jahrgangsstufe];
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

		if (currentValues.includes(val)) {
			return {
				...current,
				[key]: currentValues.filter((f) => f !== val)
			};
		} else {
			return {
				...current,
				[key]: [...currentValues, val]
			};
		}
	});
}

export async function handleQuery() {
	try {
		const offset = get(currentPage) * get(db).resultsPerPage;
		const searchVal = get(searchTerm);
		let res;
		if (searchVal || get(filterIsSelected)) {
			res = await queryFTS(searchVal, offset);
		} else {
			res = await queryAllLP(offset);
		}
		const results = await res.json();
		db.update((db) => {
			return { ...db, results };
		});
	} catch (error) {
		console.error('Error fetching results:', error);
	}
}

currentPage.subscribe((store) => {
	handleQuery();
});

export const resetFilters = () => {
	searchTerm.set('');
	selectedFilters.set(initSelectedFilters());
	db.update((db) => ({ ...db, results: [] }));
	handleQuery();
};
