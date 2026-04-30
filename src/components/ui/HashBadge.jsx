export default function HashBadge({ status, className = '' }) {
  const isIntact = status === 'INTACT'
  const color = isIntact
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800'

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color} ${className}`}>
      {status}
    </span>
  )
}
