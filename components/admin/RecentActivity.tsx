export default function RecentActivity() {
  const activities = [
    {
      text: "New article published",
      time: "2 minutes ago",
      icon: "📰",
    },
    {
      text: "Admin logged in",
      time: "10 minutes ago",
      icon: "👤",
    },
    {
      text: "Advertisement updated",
      time: "1 hour ago",
      icon: "📢",
    },
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">

      <h3 className="mb-5 text-xl font-bold text-gray-900">
        Recent Activity
      </h3>


      <div className="space-y-4">

        {activities.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b pb-3 last:border-none"
          >

            <div className="text-2xl">
              {item.icon}
            </div>


            <div>
              <p className="font-medium text-gray-800">
                {item.text}
              </p>

              <p className="text-sm text-gray-500">
                {item.time}
              </p>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
