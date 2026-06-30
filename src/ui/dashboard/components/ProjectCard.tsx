interface ProjectCardProps {
  title: string;
  client: string;
  status: string;
  statusClass: string;
  percent: number;
  avatars: Avatar[];
}
interface Avatar {
  img?: string;
  initials?: string;
}

export function ProjectCard({
  title,
  client,
  status,
  statusClass,
  percent,
  avatars,
}: ProjectCardProps) {
  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-5 flex-1">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-gray-100 font-semibold leading-snug">{title}</h3>
          <p className="text-sm text-gray-100/30 mt-1">{client}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-md tracking-wide ${statusClass}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-gray-100/30 mb-2">
          <span>Completion</span>
          <span className="text-gray-100">{percent}%</span>
        </div>
        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center -space-x-2">
        {avatars.map((a: Avatar, i: number) =>
          a.img ? (
            <img
              key={i}
              src={a.img}
              alt=""
              className="w-7 h-7 rounded-full border-2 border-zinc-900 object-cover"
            />
          ) : (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-zinc-900 bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-200 font-medium"
            >
              {a.initials}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
