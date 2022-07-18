import prisma from 'lib/prisma'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(501).end()
  }

  const session = await getSession({ req })

  if (!session) return res.status(401).json({ message: 'Not logged in' })

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  })

  if (!user) return res.status(401).json({ message: 'User not found' })

  if (req.method === 'POST') {
    await prisma.vote.upsert({
      where: {
        authorId_postId: {
          authorId: user.id,
          postId: req.body.post,
        },
      },
      update: {
        up: req.body.up,
      },
      create: {
        up: req.body.up,
        post: {
          connect: {
            id: req.body.post,
          },
        },
        author: {
          connect: { id: user.id },
        },
      },
    })

    res.end()
    return
  }
}