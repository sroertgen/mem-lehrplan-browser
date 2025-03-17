import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	try {
		const res = await fetch(`/api/subjectInfo?subject=${encodeURIComponent(params.url)}`);
		const subjectInfo = await res.json();

		if (subjectInfo) {
			console.log(subjectInfo);
			return { subjectInfo };
		}

		error(404, 'Not found');
	} catch (err) {
		console.error('Error fetching results:', err);
		error(500, 'Failed to load data');
	}
}
