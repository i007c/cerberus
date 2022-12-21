import { PostModel, Rating, ServerModel } from 'types'
import { IMAGE_EXT, Parser, update_tags, VIDEO_EXT } from './shared'

interface ACD {
    value: string
    type: string
    label: string
}

var ACAC = new AbortController()

const rule34: ServerModel = {
    rating_table: {
        q: 'questionable',
        e: 'explicit',
        s: 'safe',
    },
    autocomplete: async query => {
        ACAC.abort()
        ACAC = new AbortController()

        const url = `https://rule34.xxx/public/autocomplete.php?q=${query}`
        let data: ACD[] = []

        try {
            let response = await fetch(url, { signal: ACAC.signal })
            data = await response.json()
        } catch (error) {
            return []
        }

        return data.map(({ value, type, label }) => {
            let count_str = label.split(value + ' ').at(-1)!
            let count = parseInt(count_str.slice(1, -1))
            count = isNaN(count) ? -1 : count

            return {
                type,
                name: value,
                count,
            }
        })
    },
    search: async function (tags, page) {
        ACAC.abort()
        tags = update_tags(tags, 'sort:score')
        let url = 'https://api.rule34.xxx/index.php?page=dapi&s=post'
        url += '&q=index&pid=' + page

        if (tags) {
            url += '&tags=' + tags
        }

        const response = await fetch(url)

        const text = await response.text()
        if (!text) return []

        const xml = Parser.parseFromString(text, 'text/xml')
        const posts = xml.querySelector('posts')!
        const posts_list = posts.querySelectorAll('post')
        const data: PostModel[] = []

        posts_list.forEach(post => {
            const file = post.getAttribute('file_url')!

            const ext = file.split('.').at(-1) || 'png'
            let type: 'image' | 'video' = 'image'

            const rating_key = <'q' | 's' | 'e'>post.getAttribute('rating')

            if (VIDEO_EXT.includes(ext)) {
                type = 'video'
            } else if (!IMAGE_EXT.includes(ext)) {
                throw Error(ext)
            }

            data.push({
                type,
                score: parseInt(post.getAttribute('score')!),
                file: file,
                parent_id: parseInt(post.getAttribute('parent_id')!),
                sample: post.getAttribute('sample_url')!,
                id: parseInt(post.getAttribute('id')!),
                has_children: post.getAttribute('has_children') === 'true',
                tags: post.getAttribute('tags')!.trim().split(' '),
                rating: <Rating>this.rating_table[rating_key],
            })
        })

        return data
    },
    open_post: post_id => {
        open(`https://rule34.xxx/index.php?page=post&s=view&id=${post_id}`)
    },
}

export { rule34 }
