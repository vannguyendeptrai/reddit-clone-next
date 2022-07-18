import fs from 'fs'
import path from 'path'
import AWS from 'aws-sdk'

import prisma from 'lib/prisma'
import { getSession } from 'next-auth/react'
import middleware from 'middleware/middleware'
import nextConnect from 'next-connect'

const handler = nextConnect()

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
})
  
const uploadFile = (filePath, fileName, id) => {
    return new Promise((resolve, reject) => {
        const content = fs.readFileSync(filePath)
    
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `post-${id}${path.extname(fileName)}`,
            Body: content,
        }
    
        s3.upload(params, (err, data) => {
            if (err) {
            reject(err)
            }
            resolve(data.Location)
        })
    })
}

handler.use(middleware)

handler.post(async(req, res) => {
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
        const post = await prisma.post.create({
            data: {
                title: req.body.title[0],
                content: req.body.content[0],
                subreddit: {
                    connect: {
                    name: req.body.subreddit_name[0],
                    },
                },
                author: {
                    connect: { id: user.id },
                },
            },
        })

        if (req.files && req.files.image[0] && req.files.image[0].size > 0) {
            const location = await uploadFile(
                req.files.image[0].path,
                req.files.image[0].originalFilename,
                post.id
            )
        
            await prisma.post.update({
                where: { id: post.id },
                data: {
                    image: location,
                },
            })
        }
        
        res.json(post)
        return
    }
})

export const config = {
    api: {
        bodyParser: false,
    },
}

export default handler