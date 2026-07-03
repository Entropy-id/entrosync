interface InputFieldProps {
	label?: string;
	type: string;
	placeholder: string;
	id: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function InputField({ label, type, placeholder, id, value, onChange }: InputFieldProps) {
	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label htmlFor={id} className="text-sm text-gray-300">
					{label}
				</label>
			)}
			<input
				id={id}
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
			/>
		</div>
	);
}
