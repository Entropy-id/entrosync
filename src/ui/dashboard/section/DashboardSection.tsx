import { ActiveProject } from "../layouts/ActiveProject";
import { ActivityFeed } from "../layouts/ActivityFeed";
import { PayoutSchedule } from "../layouts/PayoutSchedule";
import { Status } from "../layouts/Status";

export function DashboardSection() {
	return (
		<>
			{/*Status*/}
			<Status />

			{/* Active Projects */}
			<ActiveProject />

			{/* Payout Schedule */}
			<PayoutSchedule />

			{/* Activity Feed */}
			<ActivityFeed />
		</>
	);
}
