import Head from 'next/head'
import { getPosts } from 'lib/data.js'
import prisma from 'lib/prisma'
import Posts from 'components/Posts'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Home({ posts }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const loading = status === 'loading'

  if (loading) {
    return null
  }

  if (session && !session.user.name) {
    router.push('/setup')
  }
  return (
    <div>
      <Head>
        <title>Reddit Clone</title>
        <meta name='description' content='A great social network!' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <header className='bg-black text-white h-12 flex pt-3 px-5 pb-2'>
        <p>Reddit clone</p>
        <p className='grow'></p>
        {session ? 
          <>
            <Link href={`/api/auth/signin`}>
              <a
                className='flex-l border px-4 font-bold rounded-full mb-1'
              >
                login
              </a>
            </Link>
          </> 
          : 
          <>
            <Link href={`/api/auth/signout`}>
              <a
                className='flex-l border px-4 font-bold rounded-full mb-1'
              >
                logout
              </a>
            </Link>
          </>
        }
      </header>

      <Posts posts={posts} />
    </div>
  )
}

export async function getServerSideProps() {
  let posts = await getPosts(prisma)
  posts = JSON.parse(JSON.stringify(posts))

  return {
    props: {
      posts: posts,
    },
  }
}