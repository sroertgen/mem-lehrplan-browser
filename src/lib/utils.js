export function isValidURI(value) {
	try {
		new URL(value);
		return true;
	} catch (e) {
		return false;
	}
}

export const capitalize = (s) => s && String(s[0]).toUpperCase() + String(s).slice(1);
