export function toNumber(value: unknown): number {
	if (value === null || value === undefined) return 0;
	if (typeof value === "number") return value;
	if (typeof value === "string") return Number.parseFloat(value);
	if (
		typeof value === "object" &&
		"toNumber" in value &&
		typeof value.toNumber === "function"
	) {
		return (value as { toNumber: () => number }).toNumber();
	}
	return Number(value);
}

export function toISOString(date: Date | null | undefined): string | null {
	return date ? date.toISOString() : null;
}
