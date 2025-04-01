/** @typedef {import('./types.js').ResultItem} ResultItem */

export function isValidURI(value) {
	try {
		new URL(value);
		return true;
	} catch (e) {
		return false;
	}
}

export const capitalize = (s) => s && String(s[0]).toUpperCase() + String(s).slice(1);

/**
 * Function to merge the array into a single object with arrays of values
 * @returns {ResultItem}
 */

export function mergeQueryResult(bindings) {
	// First, transform the SPARQL results into a grouped object
	const groupedByProperty = bindings.reduce((grouped, binding) => {
		// For each property in the binding
		Object.keys(binding).forEach((property) => {
			// Initialize the array if it doesn't exist
			if (!grouped[property]) {
				grouped[property] = [];
			}
			// Add the property value to the array
			grouped[property].push(binding[property]);
		});
		return grouped;
	}, {});

	// Then remove duplicates from each property group
	const uniqueValues = {};
	for (const property in groupedByProperty) {
		// Filter out duplicates based on the "value" property
		const seen = new Set();
		uniqueValues[property] = groupedByProperty[property].filter((item) => {
			const value = item.value;
			if (seen.has(value)) {
				return false;
			}
			seen.add(value);
			return true;
		});
	}

	return uniqueValues;
}
