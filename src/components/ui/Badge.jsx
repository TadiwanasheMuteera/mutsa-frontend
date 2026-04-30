export default function Badge({ status, className = '' }) {
  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    ARCHIVED: 'bg-red-100 text-red-800',
    RELEASED: 'bg-blue-100 text-blue-800',
  }

  const color = statusColors[status] || 'bg-gray-100 text-gray-800'

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color} ${className}`}>
      {status}
    </span>
  )
}
