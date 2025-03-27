/**
 * @typedef {Object} Uri
 * @property {string} type - The type of the URI (e.g., "uri")
 * @property {string} value - The actual URI value
 */

/**
 * @typedef {Object} Label
 * @property {string} lang ["xml:lang"] - The language of the label (e.g., "de")
 * @property {string} type - The type of the label (e.g., "literal")
 * @property {string} value - The actual label text
 */

/**
 * @typedef {Object} FilterItem
 * @property {Uri} uri - The URI object for the item
 * @property {Label} label - The label object for the item
 */

export {};
