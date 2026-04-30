export default function StatCard({ title, value, icon: Icon, color = 'accent' }) {
  const colorMap = {
    accent: 'bg-accent',
    primary: 'bg-primary',
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  }

  const bgColor = colorMap[color] || colorMap.accent

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-primary mt-2">{value}</p>
        </div>
        {Icon && (
          <div className={`${bgColor} p-3 rounded-xl text-white shadow-sm`}>
            <Icon size={28} />
          </div>
        )}
      </div>
    </div>
  )
}
