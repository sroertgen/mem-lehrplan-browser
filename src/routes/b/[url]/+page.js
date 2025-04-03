import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	try {
		const res = await fetch(`/api/allTriples?subject=${encodeURIComponent(params.url)}`);
		const subjectInfo = await res.json();

		if (subjectInfo) {
			return { subjectInfo, url: params.url };
		}

		error(404, 'Not found');
	} catch (err) {
		console.error('Error fetching results:', err);
		error(500, 'Failed to load data');
	}
}
