import { useState } from "react";
import { authClient } from "#/lib/auth.client";
import { InputField } from "./InputField";

interface LoginFormProps {
	onToggle: () => void;
}

export function LoginForm({ onToggle }: LoginFormProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const { data, error } = await authClient.signIn.email({
			email,
			password,
		});

		if (error) {
			console.error("Login failed:", error.message);
		} else {
			console.log("Login successful!", data);
		}
	};
	return (
		<div className="w-full max-w-sm mx-auto space-y-6">
			{/* Header */}
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-1">Welcome back</h2>
				<p className="text-gray-400 text-sm">Sign-in to your account</p>
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
					id="email"
					label="Email"
					type="email"
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<div className="flex flex-col gap-1">
					<div className="flex justify-between items-center">
						<label htmlFor="password" className="text-sm text-gray-300">
							Password
						</label>
						<a href="#" className="text-xs text-gray-500 hover:text-gray-300">
							Forgot Password?
						</a>
					</div>
					<InputField
						id="password"
						type="password"
						placeholder="Enter your password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>

				{/* Submit Button */}
				<button
					type="submit"
					className="w-full bg-neutral-900 text-white font-medium py-2.5 rounded-full border border-neutral-800 hover:bg-neutral-800 transition-colors"
				>
					Sign In
				</button>
			</form>

			{/* Footer Link */}
			<p className="text-center text-sm text-gray-400">
				Don't have an account?{" "}
				<button
					type="button"
					onClick={onToggle}
					className="text-white hover:underline bg-transparent border-none p-0 cursor-pointer"
				>
					Sign Up
				</button>
			</p>
		</div>
	);
}
