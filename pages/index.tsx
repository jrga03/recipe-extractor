import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Head>
        <title>Recipe Extractor</title>
        <meta name="description" content="Extract recipes using the recipe URL" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      Hello world
    </div>
  )
}

export default Home
