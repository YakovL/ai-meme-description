import fs from 'fs'
import OpenAI from 'openai'

const apiKey = ""
const imgPath = ""

const client = new OpenAI({ apiKey })
const getImageReply = async (imageUrl: string, prompt: string, optionalParams?: {
    temperature?: number
    model?: OpenAI.Chat.ChatModel
    // can also check other choices, not just the first one
}) => {
    const response = await client.chat.completions.create({
        // prices are similar (openai.com/api/pricing), gpt-4o (gpt-4o-2024-08-06) should be good enough
        model: optionalParams?.model ?? 'gpt-4o',
        messages: [{
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: prompt,
                },
                {
                    type: 'image_url',
                    image_url: {
                        url: imageUrl
                    },
                },
            ],
        }],
        temperature: optionalParams?.temperature ?? 0.5,
    })

    return response.choices[0].message.content
}

;(async() => {
    if(!apiKey || !imgPath) {
        console.error("don't forget to set apiKey and imgPath")
        return
    }

    // image: read from DB instead, maybe get mime from it/deduce it
    const imageBuffer = fs.readFileSync(imgPath)
    const base64String = imageBuffer.toString('base64')
    const mimeType = 'image/jpeg'
    const base64Url = `data:${mimeType};base64,${base64String}`

    const response = await getImageReply(base64Url, 
        `Please describe the image in a meme-like style, funny and weird (the weirder the better).
        Suggest also a title for it, like this is a memecoin logo.`
        .replace(/\s+/g, ' '), // remove extra whitespace
    )

    console.log('response:', response)
})()