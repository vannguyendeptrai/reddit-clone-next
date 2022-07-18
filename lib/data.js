export const getPosts = async (prisma) => {
    const posts = await prisma.post.findMany({
        where: {},
        orderBy: [
            {
            id: 'desc',
            },
        ],
        include: {
            author: true,
        }
    })
  
    return posts
}

export const getSubreddit = async (name, prisma) => {
    return await prisma.subreddit.findUnique({
        where: {
            name,
        },
    })
}

export const getPostsFromSubreddit = async (subreddit, prisma) => {
    const posts = await prisma.post.findMany({
        where: {
            subreddit: {
            name: subreddit,
            },
        },
        orderBy: [
            {
            id: 'desc',
            },
        ],
        include: {
            author: true,
        },
    })
  
    return posts
}

export const getPost = async (id, prisma) => {
    const post = await prisma.post.findUnique({
        where: {
            id,
        },
        include: {
            author: true,
            comments: {
                where: {
                    parentId: null,
                },
                orderBy: [
                    {
                        id: 'desc',
                    },
                ],
                include: {
                    author: true,
                },
            },
        },
    })

    if (post.comments) {
        post.comments = await fetchCommentsOfComments(post.comments, prisma)
    }
  
    return post
}

export const getVotes = async (post, prisma) => {
    const upvotes = await prisma.vote.count({
        where: {
        postId: post,
        up: true,
        },
    })
    const downvotes = await prisma.vote.count({
        where: {
        postId: post,
        up: false,
        },
    })

    return upvotes - downvotes
}

export const getVote = async (post_id, user_id, prisma) => {
    const vote = await prisma.vote.findMany({
        where: {
        postId: post_id,
        authorId: user_id,
        },
    })

    if (vote.length === 0) return null
    return vote[0]
}
const getComments = async (parent_id, prisma) => {
    let comments = await prisma.comment.findMany({
      where: {
        parentId: parent_id,
      },
      orderBy: [
        {
          id: 'desc',
        },
      ],
      include: {
        author: true,
      },
    })
  
    if (comments.length) {
      comments = await fetchCommentsOfComments(comments, prisma)
    }
  
    return comments
}

const fetchCommentsOfComments = async (comments, prisma) => {
    const fetchCommentsOfComment = async (comment, prisma) => {
      comment.comments = await getComments(comment.id, prisma)
      return comment
    }
  
    return Promise.all(
      comments.map((comment) => {
        comment = fetchCommentsOfComment(comment, prisma)
        return comment
      })
    )
}
export const getUser = async (name, prisma) => {
    const user = await prisma.user.findUnique({
      where: {
        name,
      },
    })
  
    return user
}
export const getPostsFromUser = async (user_name, prisma) => {
    const posts = await prisma.post.findMany({
      where: {
        author: {
          name: user_name,
        },
      },
      orderBy: [
        {
          id: 'desc',
        },
      ],
      include: {
        author: true,
      },
    })
  
    return posts
}