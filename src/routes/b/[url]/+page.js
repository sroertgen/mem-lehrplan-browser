import { error } from '@sveltejs/kit';

async function getSubjectDetails(subject) {
	try {
		const res = await fetch(`/api/subjectInfo?subject=${encodeURIComponent(subject)}`);
		const results = await res.json();
		return results;
	} catch (error) {
		console.error('Error fetching results:', error);
	}
}

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const subjectInfo = await getSubjectDetails(params.url);

	if (subjectInfo) {
		console.log(subjectInfo);
		return { subjectInfo };
	}

	error(404, 'Not found');
}
