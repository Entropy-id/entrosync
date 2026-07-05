import {
	TanStackDevtools,
	TanStackRouterDevtoolsPanel,
} from "@tanstack/react-router-devtools";

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
