type StatCardProps = {
  title: string;
  value: string;
  icon: string;
};

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </h3>
        </div>

        <div className="text-4xl">
          {icon}
        </div>

      </div>

    </div>
  );
}
