export const uriMappings = {
	'http://www.w3.org/2000/01/rdf-schema#label': 'label',
	'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'type',
	'https://w3id.org/lehrplan/ontology/partOf': 'partOf',
	'https://w3id.org/lehrplan/ontology/hasPart': 'hasPart',
	'https://w3id.org/lehrplan/ontology/LP_0002049': 'Kompetenzerwartungen (BY)',
	'https://w3id.org/lehrplan/ontology/LP_0002050': 'Inhalte zu den Kompetenzen (BY)',
	'https://w3id.org/lehrplan/ontology/LP_0002043': 'Fachlehrplan (BY)',
	'https://w3id.org/lehrplan/ontology/LP_0002046': 'Lernbereich (BY)',
	'https://w3id.org/lehrplan/ontology/dauer': 'Dauer (h)',
	'https://w3id.org/lehrplan/ontology/hatSchulart': 'Schulart',
	'https://w3id.org/lehrplan/ontology/hatJahrgangsstufe': 'Jahrgangsstufe',
	'https://w3id.org/lehrplan/ontology/hatFach': 'Fach',
	'http://purl.obolibrary.org/obo/BFO_0000002': 'BFO: Continuant',
	'http://purl.obolibrary.org/obo/IAO_0000030': 'IAO: Information Content Entity',
	'http://purl.obolibrary.org/obo/BFO_0000031': 'BFO: Generically Dependent Continuant',
	'https://w3id.org/lehrplan/ontology/LP_0000261': 'Curriculares Element',
	'http://purl.obolibrary.org/obo/BFO_0000001': 'BFO: Entity',
	'https://w3id.org/lehrplan/ontology/LP_0001015': 'CE-Fragment',
	'https://w3id.org/lehrplan/ontology/LP_0000819': 'Lehrplan Plus (BY)'
};

const prefixes = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX lp: <https://w3id.org/lehrplan/ontology/>
PREFIX onto: <http://www.ontotext.com/>
`;

const isDev = process.env.NODE_ENV === 'development';

export const config = {
	filterKeys: ['subjects', 'classLevels', 'states', 'subjectsByState', 'types', 'schoolTypes'],
	endpoint: isDev
		? 'http://localhost:7200/repositories/bayern-new'
		: 'https://graphdb.edufeed.org/repositories/bayern',
	prefixes
};
