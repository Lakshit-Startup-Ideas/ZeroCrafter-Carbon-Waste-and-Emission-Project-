import './globals.css'

export const metadata = {
  title: 'ZeroCraftr - Emission Tracking Platform',
  description: 'Track energy consumption, waste disposal, and calculate carbon emissions for your manufacturing facility.',
  keywords: 'emissions, carbon footprint, sustainability, manufacturing, energy tracking',
  authors: [{ name: 'ZeroCraftr Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
} 