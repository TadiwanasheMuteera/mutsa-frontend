import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
