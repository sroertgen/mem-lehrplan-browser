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
 * @typedef {Object} ClassLevel
 * @property {string} lang ["xml:lang"] - The language of the label (e.g., "de")
 * @property {string} type - The type of the label (e.g., "literal")
 * @property {string} value - The actual label text
 */

/**
 * @typedef {Object} Subject
 * @property {string} lang ["xml:lang"] - The language of the label (e.g., "de")
 * @property {string} type - The type of the label (e.g., "literal")
 * @property {string} value - The actual label text
 */

/**
 * @typedef {Object} FilterItem
 * @property {Uri} uri - The URI object for the item
 * @property {Label} label - The label object for the item
 */

/**
 * @typedef {Object} ResultItem
 * @property {Uri} uri - The URI object for the item
 * @property {Label[]} label - The label object for the item
 * @property {Subject[]} subject - The label object for the item
 * @property {ClassLevel[]} classLevel - The class level for the item
 */

// Jahrgangsstufe[array];

export {};
