import { PostModel, Rating, ServerModel } from 'state'

import { IMAGE_EXT, VIDEO_EXT } from './shared'

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
    sort_score: 'sort:score',

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
    async search(tags, page) {
        ACAC.abort()
        let url = `https://realbooru.com/index.php?page=dapi&s=post&limit=${this.limit}`
        url += '&json=1&q=index&pid=' + page

        if (tags) url += '&tags=' + tags

        const response = await fetch(url)

        const json: JPost[] = await response.json()

        const data: PostModel[] = []

        json.forEach(post => {
            const file = post.image
            const ext = file.split('.').at(-1)

            if (!ext) {
                throw new Error(`realbooru ext not found ${ext}`)
            }


            let type: 'image' | 'video' = 'image'

            if (VIDEO_EXT.includes(ext)) {
                type = 'video'
            } else if (!IMAGE_EXT.includes(ext)) {
                throw new Error(`realbooru invalid ext not found ${ext}`)
            }

            data.push({
                type,
                score: -1,
                file: `https://realbooru.com/images/${post.directory}/${post.hash}.${ext}`,
                parent: post.parent_id,
                sample: `https://realbooru.com/images/${post.directory}/${post.hash}.${ext}`,
                id: post.id,
                has_children: false,
                tags: post.tags.trim().split(' '),
                rating: post.rating,
                ext,
                link: `https://realbooru.com/index.php?page=post&s=view&id=${post.id}`,
            })
        })

        return data
    },
    open_tags(tags) {
        open('https://realbooru.com/index.php?page=post&s=list&tags=' + tags)
    },
}

export { realbooru }
