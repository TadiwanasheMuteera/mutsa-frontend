import { format } from 'date-fns'

export default function Timeline({ items }) {
  return (
    <div className="space-y-8">
      {items?.map((item, index) => (
        <div key={item.id || index} className="flex">
          {/* Timeline dot and line */}
          <div className="flex flex-col items-center mr-4">
            <div className="w-3 h-3 bg-accent rounded-full border-2 border-white shadow-md"></div>
            {index < items.length - 1 && (
              <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
            )}
          </div>

          {/* Timeline content */}
          <div className="pb-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-primary">{item.action}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
              {item.details && (
                <div className="mt-3 text-sm text-gray-700 border-t border-gray-200 pt-3">
                  {item.details}
                </div>
              )}
              {item.officer && (
                <p className="text-xs text-gray-500 mt-2">By: {item.officer}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
