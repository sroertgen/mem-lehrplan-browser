/** @typedef {import('./types.js').ResultItem} ResultItem */
import { get } from 'svelte/store';
import { resultCounter, uri2label } from './db.js';

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
 * @returns {ResultItem[]}
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
	// TODO generalize or rework this
	const urimappings = get(uri2label);
	uniqueValues.subject = uniqueValues?.subject?.map((e) => ({
		label: { type: 'literal', value: urimappings[e.value] },
		uri: { type: e.type, value: e.value }
	}));
	uniqueValues.state = uniqueValues?.state?.map((e) => ({
		label: { type: 'literal', value: urimappings[e.value] },
		uri: { type: e.type, value: e.value }
	}));
	uniqueValues.classLevel = uniqueValues?.classLevel?.map((e) => ({
		label: { type: 'literal', value: urimappings[e.value] },
		uri: { type: e.type, value: e.value }
	}));

	return uniqueValues;
}

/**
 * Gets basic info for a given element.
 * @param {string} elementURI - URI of the element.
 * @returns {Promise<ResultItem>}
 */
export async function getElementInfo(elementURI) {
	const res = await fetch(`/api/elementInfo?element=${elementURI}`);
	const resultInfo = await res.json();
	countResultInfo(resultInfo);
	return resultInfo;
}

function countResultInfo(resultInfo) {
	resultCounter.update((currentCounter) => {
		// Create a copy of the current counter to work with
		const newCounter = { ...currentCounter };

		// Process all items in a single update
		Object.keys(resultInfo).forEach((k) => {
			resultInfo[k].forEach((r) => {
				if (r?.type === 'uri') {
					// Initialize if not present, otherwise increment
					newCounter[r.value] = (newCounter[r.value] || 0) + 1;
				}
			});
		});

		return newCounter;
	});
}

/**
 * @param {string} text - text to copy
 */
export function copyToClipboard(text) {
	navigator.clipboard
		.writeText(text)
		.then(() => {
			console.log(`${text} successfully copied to clipboard`);
			// You can add user feedback here, like updating UI
		})
		.catch((err) => {
			console.error('Failed to copy text: ', err);
		});
}

/**
 * Builds a tree structure from flat SPARQL query results
 * @param {Object} data - The SPARQL query results object
 * @returns {Object} - A tree structure
 */
export function buildTreeFromSparqlResults(data) {
	const bindings = data;

	const nodesMap = new Map();
	const partNodes = new Set();

	bindings.forEach((binding) => {
		const subjectUri = binding.s.value;
		const partUri = binding.part.value;

		// Add the subject node if it doesn't exist
		if (!nodesMap.has(subjectUri)) {
			nodesMap.set(subjectUri, {
				id: subjectUri,
				children: []
			});
		}

		// Add the part node if it doesn't exist
		if (!nodesMap.has(partUri)) {
			nodesMap.set(partUri, {
				id: partUri,
				children: []
			});
		}

		// Mark this node as a part (child)
		partNodes.add(partUri);
	});

	// Second pass: build the hierarchical structure
	bindings.forEach((binding) => {
		const subjectUri = binding.s.value;
		const partUri = binding.part.value;

		const parentNode = nodesMap.get(subjectUri);
		const childNode = nodesMap.get(partUri);

		parentNode.children.push(childNode);
	});

	const rootNodes = [];
	nodesMap.forEach((node, uri) => {
		if (!partNodes.has(uri)) {
			rootNodes.push(node);
		}
	});

	if (rootNodes.length === 1) {
		return rootNodes[0];
	}

	return rootNodes;
}
