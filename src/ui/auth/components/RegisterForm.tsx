import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
	loginWithGoogleServerFn,
	registerServerFn,
} from "#/modules/auth/auth.api";
import { InputField } from "./InputField";

interface RegisterFormProps {
	onToggle: () => void;
}

export function RegisterForm({ onToggle }: RegisterFormProps) {
	const registerServerFnHandler = useServerFn(registerServerFn);
	const loginWithGoogleServerFnHandler = useServerFn(loginWithGoogleServerFn);

	const [registerData, setRegisterData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	async function handleRegisterUser(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (registerData.password !== registerData.confirmPassword) {
			console.error("Passwords do not match!");
			return;
		}

		try {
			await registerServerFnHandler({
				data: {
					name: registerData.name,
					email: registerData.email,
					password: registerData.password,
				},
			});
		} catch (error) {
			console.error("Registration failed:", error);
		}
	}

	async function handleLoginWithGoogle() {
		try {
			await loginWithGoogleServerFnHandler();
		} catch (error) {
			console.error("Google login failed:", error);
		}
	}

	return (
		<div className="w-full max-w-sm mx-auto space-y-6">
			{/* Header */}
			<div className="text-left">
				<h2 className="text-2xl font-bold mb-1">Create Account</h2>
				<p className="text-gray-400 text-sm">Join to get started.</p>
			</div>

			{/* Google Button */}
			<button
				onClick={handleLoginWithGoogle}
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
			<form onSubmit={handleRegisterUser} className="space-y-4">
				<InputField
					id="fullName"
					label="Full Name"
					type="text"
					placeholder="Akmal Rizky / Zaghy Zalayetha"
					value={registerData.name}
					onChange={(e) =>
						setRegisterData({ ...registerData, name: e.target.value })
					}
				/>
				<InputField
					id="email"
					label="Email"
					type="email"
					placeholder="you@example.com"
					value={registerData.email}
					onChange={(e) =>
						setRegisterData({ ...registerData, email: e.target.value })
					}
				/>
				<InputField
					id="password"
					label="Password"
					type="password"
					placeholder="Enter your password"
					value={registerData.password}
					onChange={(e) =>
						setRegisterData({ ...registerData, password: e.target.value })
					}
				/>
				<InputField
					id="confirmPassword"
					label="Confirm Password"
					type="password"
					placeholder="Enter your confirmation password"
					value={registerData.confirmPassword}
					onChange={(e) =>
						setRegisterData({
							...registerData,
							confirmPassword: e.target.value,
						})
					}
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
