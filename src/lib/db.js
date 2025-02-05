import { writable, get } from 'svelte/store';
import { config } from '$lib/config';

export const db = writable({
	selectedFilters: initFilters()
});

export function getDB() {
	return get(db);
}

function initFilters() {
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
