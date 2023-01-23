import { IMAGE_EXT, update_tags, VIDEO_EXT } from './shared'
import { PostModel, Rating, ServerModel } from 'types'

type JPost = {
    directory: string
    hash: string
    height: number
    id: number
    image: string
    parent_id: number
    rating: Rating
    sample: number
    score: null
    tags: string
    width: number
}

var ACAC = new AbortController()

const realbooru: ServerModel = {
    name: 'realbooru',
    limit: 500,
    rating_table: {
        q: 'questionable',
        e: 'explicit',
        s: 'safe',
    },
    autocomplete: async query => {
        ACAC.abort()
        ACAC = new AbortController()

        const url = `https://realbooru.com/index.php?page=autocomplete&term=${query}`
        let data: string[] = []

        try {
            let response = await fetch(url, { signal: ACAC.signal })
            data = await response.json()
        } catch (error) {
            return []
        }

        return data.map(value => ({
            type: 'general',
            name: value,
            count: -1,
        }))
    },
    search: async function (tags, page) {
        ACAC.abort()
        tags = update_tags(tags, 'sort:score')
        let url = `https://realbooru.com/index.php?page=dapi&s=post&limit=${this.limit}`
        url += '&json=1&q=index&pid=' + page

        if (tags) url += '&tags=' + tags

        const response = await fetch(url)

        const json: JPost[] = await response.json()
        // if (!text) return []

        // const xml = Parser.parseFromString(text, 'text/xml')
        // const posts = xml.querySelector('posts')!
        // const posts_list = posts.querySelectorAll('post')
        const data: PostModel[] = []

        json.forEach(post => {
            // const file = post.getAttribute('file_url')!
            const file = post.image

            const ext = file.split('.').at(-1) || 'png'
            let type: 'image' | 'video' = 'image'

            if (VIDEO_EXT.includes(ext)) {
                type = 'video'
            } else if (!IMAGE_EXT.includes(ext)) {
                throw Error(ext)
            }

            data.push({
                type,
                score: -1,
                file: `https://realbooru.com/images/${post.directory}/${post.image}`,
                parent_id: post.parent_id,
                sample: `https://realbooru.com/images/${post.directory}/${post.image}`,
                id: post.id,
                has_children: false,
                tags: post.tags.trim().split(' '),
                rating: post.rating,
                ext,
            })
        })

        return data
    },
    open_post: post_id => {
        open(`https://realbooru.com/index.php?page=post&s=view&id=${post_id}`)
    },
}

export { realbooru }
