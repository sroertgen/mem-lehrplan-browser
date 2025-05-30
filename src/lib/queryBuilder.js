import { get } from 'svelte/store';
import { selectedFilters } from '$lib/db';

/** @typedef {import('./types.js').FilterItem} FilterItem */

export const statesFilter = (states) => {
	const filterLen = states.length;
	if (filterLen === 0) {
		return '?lp lp:LP_0000029 ?bundesland .';
	} else if (filterLen === 1) {
		return `?lp lp:LP_0000029 <${states[0]}> .`;
	} else {
		return states
			.map(
				/** @param {FilterItem} f */
				(f) => `\n{ ?lp lp:LP_0000029 <${f}> .}\n`
			)
			.join('\nUNION\n');
	}
};

export const subjectsFilter = (subjects) => {
	console.log(get(selectedFilters));
	const filterLen = subjects.length;
	if (filterLen === 0) {
		return '?lp lp:LP_0000537 ?fach .';
	} else if (filterLen === 1) {
		return `?lp lp:LP_0000537 <${subjects[0]}> .`;
	} else {
		return subjects
			.map(
				/** @param {FilterItem} f */
				(f) => `\n{ ?lp lp:LP_0000537 <${f}> .}\n`
			)
			.join('\nUNION\n');
	}
};

export const classLevelFilter = (levels) =>
	/** @type {FilterItem[]} */
	levels.length
		? levels
				.map(
					/** @param {FilterItem} f */
					(f) => `\n{ ?lp lp:LP_0000026 <${f}> .}\n`
				)
				.join('\nUNION\n')
		: '?lp lp:LP_0000026 ?x .';

/**
 * @param {Array<string>} types - array of type uris
 * @returns {String}
 */
export const typeFilter = (types) => {
	const filterLen = types.length;
	if (filterLen === 0) {
		return '';
	} else if (filterLen === 1) {
		return `?s a <${types[0]}> .`;
	} else {
		return types.map((f) => `\n{ ?s a <${f}> .}\n`).join('\nUNION\n');
	}
};

/**
 * @param {Array<string>} types - array of type uris
 * @returns {String}
 */
export const schoolTypeFilter = (types) => {
	const filterLen = types.length;
	if (filterLen === 0) {
		return '';
	} else if (filterLen === 1) {
		return `?lp lp:LP_0000812 <${types[0]}> .`;
	} else {
		return types.map((f) => `\n{ ?lp lp:LP_0000812 <${f}> .}\n`).join('\nUNION\n');
	}
};
