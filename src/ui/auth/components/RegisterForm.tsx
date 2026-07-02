import { useState } from "react";
import { authClient } from "#/lib/auth.client";
import { InputField } from "./InputField";

interface RegisterFormProps {
	onToggle: () => void;
}

export function RegisterForm({ onToggle }: RegisterFormProps) {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			console.error("Password do not match!");
			return;
		}

		const { data, error } = await authClient.signUp.email({
			email,
			password,
			name: fullName,
		});

		if (error) {
			console.error("Registration failed:", error.message);
		} else {
			console.log("Registration successful!", data);
		}
	};
	return (
		<div className="w-full max-w-sm mx-auto space-y-6">
			{/* Header */}
			<div className="text-left">
				<h2 className="text-2xl font-bold mb-1">Create Account</h2>
				<p className="text-gray-400 text-sm">Join to get started.</p>
			</div>

			{/* Google Button */}
			<button
				type="button"
				className="w-full bg-white text-black font-medium py-2.5 rounded-full hover:bg-gray-200 transition-colors"
			>
				Continue with Google
			</button>

			{/* Divider */}
			<div className="relative flex items-center justify-center">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-neutral-800"></div>
				</div>
				<span className="relative bg-black px-3 text-xs text-gray-500">OR</span>
			</div>

			{/* Form Fields */}
			<form onSubmit={handleSubmit} className="space-y-4">
				<InputField
					id="fullName"
					label="Full Name"
					type="text"
					placeholder="Akmal Rizky / Zaghy Zalayetha"
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
				/>
				<InputField
					id="email"
					label="Email"
					type="email"
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<InputField
					id="password"
					label="Password"
					type="password"
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<InputField
					id="confirmPassword"
					label="Confirm Password"
					type="password"
					placeholder="Enter your confirmation password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>

				{/* Submit Button */}
				<button
					type="submit"
					className="w-full bg-neutral-900 text-white font-medium py-2.5 rounded-full border border-neutral-800 hover:bg-neutral-800 transition-colors"
				>
					Sign Up
				</button>
			</form>

			{/* Footer Link */}
			<p className="text-center text-sm text-gray-400">
				Already have an account?{" "}
				<button
					type="button"
					onClick={onToggle}
					className="text-white hover:underline bg-transparent border-none p-0 cursor-pointer"
				>
					Sign In
				</button>
			</p>
		</div>
	);
}
