import { writable, get } from 'svelte/store';
import { config } from '$lib/config';
import { queryFTS } from '$lib/fts';

export const db = writable({
	filters: initFilters(),
	selectedFilters: initSelectedFilters(),
	results: []
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
	db.update((db) => {
		return { ...db, filters: [faecher, jahrgangsstufe] };
	});
}

function initSelectedFilters() {
	return Object.fromEntries(config.filterKeys.map((e) => [e, []]));
}

export function toggleFilter(key, val) {
	let selectedFilters;
	db.update((db) => {
		if (db.selectedFilters?.[key]?.includes(val)) {
			selectedFilters = {
				...db.selectedFilters,
				[key]: db.selectedFilters[key].filter((f) => f !== val)
			};
		} else {
			selectedFilters = {
				...db.selectedFilters,
				[key]: [...db.selectedFilters[key], val]
			};
		}
		return { ...db, selectedFilters };
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
