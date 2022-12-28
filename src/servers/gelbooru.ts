import { ServerModel } from 'types'
import { IMAGE_EXT, update_tags, VIDEO_EXT } from './shared'

var ACAC = new AbortController()

interface ADC {
    type: string
    label: string
    value: string
    post_count: string
    category: string
}

interface PD {
    file_url: string
    has_children: 'false' | 'true'
    id: number
    parent_id: number
    rating: string
    sample_url: string
    score: number
    tags: string
}

const gelbooru: ServerModel = {
    name: 'gelbooru',
    limit: 100,
    autocomplete: async query => {
        ACAC.abort()
        ACAC = new AbortController()

        const url = `https://gelbooru.com/index.php?page=autocomplete2&term=${query}&type=tag_query&limit=10`
        let data: ADC[] = []

        try {
            let response = await fetch(url, { signal: ACAC.signal })
            data = await response.json()
        } catch (error) {
            return []
        }

        return data.map(({ category, value, post_count }) => ({
            type: category,
            name: value,
            count: parseInt(post_count),
        }))
    },
    search: async function (tags, page) {
        ACAC.abort()
        tags = update_tags(tags, 'sort:score')
        let url = 'https://gelbooru.com/index.php?page=dapi&s=post&json=1'
        url += '&q=index&pid=' + page

        if (tags) url += '&tags=' + tags

        const response = await fetch(url)

        let data = await response.json()

        if (!data['post']) return []

        let posts_list: PD[] = data['post']

        return posts_list.map(post => {
            const ext = post.file_url.split('.').at(-1) || 'png'
            let type: 'image' | 'video' = 'image'
            if (VIDEO_EXT.includes(ext)) {
                type = 'video'
            } else if (!IMAGE_EXT.includes(ext)) {
                alert('new ext: ' + ext)
                throw Error(ext)
            }

            return {
                type,
                ext,
                file: post.file_url,
                sample: post.sample_url || post.file_url,
                rating: 'questionable',
                has_children: post.has_children === 'true',
                id: post.id,
                parent_id: post.parent_id === 0 ? null : post.parent_id,
                score: post.score,
                tags: post.tags.split(' '),
            }
        })
    },
    open_post: post_id => {
        open(`https://gelbooru.com/index.php?page=post&s=view&id=${post_id}`)
    },
    rating_table: {},
}

export { gelbooru }
