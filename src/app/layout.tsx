import type { Metadata } from 'next'
import Footer from './_components/Footer';
import NavBar from './_components/NavBar'

import './style.css'

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
        <header><NavBar /></header>
        <section >{children}</section>
        <footer><Footer /></footer>
      </body>
    </html>
  )
}
