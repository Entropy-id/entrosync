import { TanStackDevtools } from "@tanstack/react-router-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

export function DevtoolsPanel() {
	return (
		<TanStackDevtools
			config={{
				position: "bottom-right",
			}}
			plugins={[
				{
					name: "Tanstack Router",
					render: <TanStackRouterDevtoolsPanel />,
				},
			]}
		/>
	);
}