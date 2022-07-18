import { useRouter } from 'next/router'
import { useState } from 'react'

export default function NewComment({ post, comment }) {
  const router = useRouter()
  const [content, setContent] = useState('')

  return (
    <form
      className='flex flex-col mt-10'
      onSubmit={async (e) => {
        e.preventDefault()
        if (!content) {
          alert('Enter some text in the comment')
          return
        }
        const res = await fetch('/api/comment', {
          body: JSON.stringify({
            post: post.id,
            comment: comment?.id,
            content: content,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })
        router.reload(window.location.pathname)
      }}
    >
      <textarea
        className='border border-gray-700 p-4 w-full text-lg font-medium bg-transparent outline-none color-primary '
        rows={1}
        cols={50}
        placeholder='Add a comment'
        onChange={(e) => setContent(e.target.value)}
      />
      <div className='mt-5'>
        <button className='border border-gray-700 px-8 py-2 mt-0 mr-8 font-bold '>
          Comment
        </button>
      </div>
    </form>
  )
}