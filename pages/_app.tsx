import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from '../contexts/AuthContext'
import GlobalInspirationBox from '../components/GlobalInspirationBox'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>Flavatix - Taste the World, One Sip at a Time</title>
        <meta name="description" content="Flavatix is the world's most pivotal tasting app for coffee and drinks, designed to be the most user-friendly tasting experience ever created." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="var(--color-primary)" />
        <link rel="icon" href="https://kobuclkvlacdwvxmakvq.supabase.co/storage/v1/object/public/images/flavicon.png" />
        <link rel="apple-touch-icon" href="https://kobuclkvlacdwvxmakvq.supabase.co/storage/v1/object/public/images/flavicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400&display=swap" rel="stylesheet" />
      </Head>
      <GlobalInspirationBox>
        <Component {...pageProps} />
      </GlobalInspirationBox>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  )
}