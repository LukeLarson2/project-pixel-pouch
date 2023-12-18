import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pixel Pouch',
  description: 'Secure and streamline file storage and messaging from web developer to client',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
    <header>

    </header>
      <section >{children}</section>
      <footer></footer>
      </body>
    </html>
  )
}
