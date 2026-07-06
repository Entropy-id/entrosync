import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontFamily: "Helvetica",
		fontSize: 11,
		color: "#1a1a1a",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 30,
		borderBottomWidth: 2,
		borderBottomColor: "#09090b",
		paddingBottom: 16,
	},
	brand: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#09090b",
	},
	invoiceLabel: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#09090b",
		letterSpacing: 1,
	},
	section: {
		marginBottom: 20,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	col: {
		width: "48%",
	},
	label: {
		fontSize: 10,
		color: "#71717a",
		marginBottom: 4,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	value: {
		fontSize: 12,
		color: "#18181b",
		fontWeight: "medium",
	},
	table: {
		marginTop: 24,
		marginBottom: 24,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#09090b",
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	tableHeaderCell: {
		color: "#ffffff",
		fontSize: 10,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	tableRow: {
		flexDirection: "row",
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#e4e4e7",
	},
	tableCell: {
		fontSize: 11,
		color: "#3f3f46",
	},
	amountCell: {
		fontSize: 11,
		color: "#18181b",
		fontWeight: "bold",
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "flex-end",
		paddingVertical: 14,
		paddingHorizontal: 12,
		marginTop: 8,
		borderTopWidth: 2,
		borderTopColor: "#09090b",
	},
	totalLabel: {
		fontSize: 13,
		fontWeight: "bold",
		color: "#09090b",
		marginRight: 24,
	},
	totalValue: {
		fontSize: 13,
		fontWeight: "bold",
		color: "#09090b",
	},
	statusBadge: {
		alignSelf: "flex-start",
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 999,
		fontSize: 10,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	statusPaid: {
		backgroundColor: "#ecfdf5",
		color: "#059669",
	},
	statusPending: {
		backgroundColor: "#eff6ff",
		color: "#2563eb",
	},
	footer: {
		position: "absolute",
		bottom: 30,
		left: 40,
		right: 40,
		textAlign: "center",
		fontSize: 10,
		color: "#a1a1aa",
	},
});

export interface InvoicePdfData {
	id: string;
	amount: number;
	status: "PENDING" | "PAID";
	issuedDate: string | null;
	projectTitle?: string;
	freelancerName?: string;
	clientName?: string;
	paymentLink?: string | null;
}

function formatDate(dateStr: string | null): string {
	if (!dateStr) return "—";
	const d = new Date(dateStr);
	return d.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

function formatCurrency(amount: number): string {
	return `$${amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

function addDays(dateStr: string | null, days: number): string {
	if (!dateStr) return "—";
	const d = new Date(dateStr);
	d.setDate(d.getDate() + days);
	return d.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export function InvoicePDFDocument({
	id,
	amount,
	status,
	issuedDate,
	projectTitle,
	freelancerName,
	clientName,
}: InvoicePdfData) {
	const invoiceNumber = `INV-${id.slice(0, 8).toUpperCase()}`;
	const displayDate = formatDate(issuedDate);
	const dueDate = addDays(issuedDate, 14);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.brand}>EntroSync</Text>
					<Text style={styles.invoiceLabel}>INVOICE</Text>
				</View>

				{/* Meta row */}
				<View style={styles.row}>
					<View style={styles.col}>
						<Text style={styles.label}>Invoice Number</Text>
						<Text style={styles.value}>{invoiceNumber}</Text>
					</View>
					<View style={styles.col}>
						<View style={styles.row}>
							<View style={{ width: "50%" }}>
								<Text style={styles.label}>Issue Date</Text>
								<Text style={styles.value}>{displayDate}</Text>
							</View>
							<View style={{ width: "50%" }}>
								<Text style={styles.label}>Due Date</Text>
								<Text style={styles.value}>{dueDate}</Text>
							</View>
						</View>
					</View>
				</View>

				{/* From / To */}
				<View style={[styles.row, { marginTop: 16 }]}>
					<View style={styles.col}>
						<Text style={styles.label}>From</Text>
						<Text style={styles.value}>
							{freelancerName ?? "Freelancer"}
						</Text>
						<Text style={{ fontSize: 10, color: "#71717a", marginTop: 2 }}>
							Via EntroSync
						</Text>
					</View>
					<View style={styles.col}>
						<Text style={styles.label}>Bill To</Text>
						<Text style={styles.value}>
							{clientName ?? projectTitle ?? "Client"}
						</Text>
						{projectTitle && (
							<Text
								style={{ fontSize: 10, color: "#71717a", marginTop: 2 }}
							>
								Project: {projectTitle}
							</Text>
						)}
					</View>
				</View>

				{/* Status */}
				<View style={{ marginTop: 16, marginBottom: 8 }}>
					<Text style={styles.label}>Status</Text>
					<Text
						style={[
							styles.statusBadge,
							status === "PAID" ? styles.statusPaid : styles.statusPending,
						]}
					>
						{status}
					</Text>
				</View>

				{/* Table */}
				<View style={styles.table}>
					<View style={styles.tableHeader}>
						<Text style={[styles.tableHeaderCell, { flex: 3 }]}>
							Description
						</Text>
						<Text
							style={[
								styles.tableHeaderCell,
								{ flex: 1, textAlign: "right" },
							]}
						>
							Amount
						</Text>
					</View>
					<View style={styles.tableRow}>
						<Text style={[styles.tableCell, { flex: 3 }]}>
							{projectTitle
								? `Project services — ${projectTitle}`
								: "Project services"}
						</Text>
						<Text
							style={[styles.amountCell, { flex: 1, textAlign: "right" }]}
						>
							{formatCurrency(amount)}
						</Text>
					</View>
				</View>

				{/* Total */}
				<View style={styles.totalRow}>
					<Text style={styles.totalLabel}>Total</Text>
					<Text style={styles.totalValue}>{formatCurrency(amount)}</Text>
				</View>

				{/* Footer */}
				<View style={styles.footer}>
					<Text>
						Thank you for your business. Questions? Contact your freelancer via
						EntroSync.
					</Text>
				</View>
			</Page>
		</Document>
	);
}
