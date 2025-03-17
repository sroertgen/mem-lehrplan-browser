import { writable, get } from 'svelte/store';
import { config } from '$lib/config';
import { queryFTS, queryAllLP } from '$lib/queryBuilder';

export const searchTerm = writable('');
export const currentPage = writable(0);
export const filters = writable([]);
initFilters();
export const selectedFilters = writable(initSelectedFilters());

export const db = writable({
	results: [],
	resultsPerPage: 10
});

export function getDB() {
	return get(db);
}

async function initFilters() {
	const faecherRaw = await fetch(`/api/getFilters?filter=${'fach'}`);
	const faecherList = await faecherRaw.json();
	const sortedFaecher = faecherList.sort((a, b) =>
		a.fach.value.localeCompare(b.fach.value, 'de', { sensitivity: 'base' })
	);
	const faecher = ['fach', sortedFaecher];

	const jahrgangsstufeRaw = await fetch(`/api/getFilters?filter=${'jahrgangsstufe'}`);
	const jahrgangsstufeList = await jahrgangsstufeRaw.json();
	const sortedJahrgangsstufe = jahrgangsstufeList.sort(
		(a, b) => Number(a.jahrgangsstufe.value) - Number(b.jahrgangsstufe.value)
	);

	const jahrgangsstufe = ['jahrgangsstufe', sortedJahrgangsstufe];
	const bundesland = [
		'bundesland',
		[
			{
				bundesland: {
					uri: '',
					value: 'Alle'
				}
			},
			{
				bundesland: {
					uri: 'https://w3id.org/lehrplan/ontology/LP_3000051',
					value: 'Bayern'
				}
			}
		]
	];
	filters.update((filters) => {
		return [bundesland, faecher, jahrgangsstufe];
	});
}

function initSelectedFilters() {
	return Object.fromEntries(config.filterKeys.map((e) => [e, []]));
}

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

export async function handleQuery(searchTerm) {
	try {
		const res = await queryFTS(searchTerm);
		const results = await res.json();
		db.update((db) => {
			return { ...db, results };
		});
	} catch (error) {
		console.error('Error fetching results:', error);
	}
}

export async function allLP() {
	try {
		const offset = get(currentPage) * get(db).resultsPerPage;
		console.log('offset', offset);
		const res = await queryAllLP(offset);
		const lps = await res.json();
		db.update((db) => {
			return { ...db, lps };
		});
	} catch (error) {
		console.error('Error fetching results:', error);
	}
}

currentPage.subscribe((store) => {
	allLP();
});

export const resetFilters = () => {
	searchTerm.set('');
	selectedFilters.set(initSelectedFilters());
	db.update((db) => ({ ...db, results: [] }));
	allLP();
};
