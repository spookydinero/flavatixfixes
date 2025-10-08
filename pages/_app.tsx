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
        <title>Flavatix - The one place for all your tasting needs</title>
        <meta name="description" content="The world's most pivotal tasting app for anything with flavor or aroma. Discover, analyze, and share your tasting experiences with our user-friendly platform." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="var(--color-primary)" />
        <link rel="icon" href="https://kobuclkvlacdwvxmakvq.supabase.co/storage/v1/object/public/images/flavicon.png" />
        <link rel="apple-touch-icon" href="https://kobuclkvlacdwvxmakvq.supabase.co/storage/v1/object/public/images/flavicon.png" />
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