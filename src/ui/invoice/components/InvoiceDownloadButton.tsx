import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { InvoicePDFDocument } from "#/modules/invoice/invoice.pdf";

interface InvoiceDownloadButtonProps {
	id: string;
	amount: number;
	status: "PENDING" | "PAID";
	issuedDate: string | null;
	projectTitle?: string;
	freelancerName?: string;
	clientName?: string;
	size?: "sm" | "md";
}

export function InvoiceDownloadButton({
	id,
	amount,
	status,
	issuedDate,
	projectTitle,
	freelancerName,
	clientName,
	size = "md",
}: InvoiceDownloadButtonProps) {
	const [loading, setLoading] = useState(false);

	async function handleDownload() {
		setLoading(true);
		try {
			const blob = await pdf(
				<InvoicePDFDocument
					id={id}
					amount={amount}
					status={status}
					issuedDate={issuedDate}
					projectTitle={projectTitle}
					freelancerName={freelancerName}
					clientName={clientName}
				/>,
			).toBlob();

			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `invoice-${id.slice(0, 8).toUpperCase()}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error("Failed to generate PDF:", err);
			alert("Failed to generate PDF. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	const iconSize = size === "sm" ? 14 : 16;
	const padding = size === "sm" ? "p-1.5" : "p-2";

	return (
		<button
			type="button"
			onClick={handleDownload}
			disabled={loading}
			className={`${padding} rounded-lg hover:bg-neutral-800 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50`}
			title="Download PDF"
		>
			{loading ? (
				<Loader2 size={iconSize} className="animate-spin" />
			) : (
				<Download size={iconSize} />
			)}
		</button>
	);
}
