import { PostModel, Rating, ServerModel } from 'types'
import { IMAGE_EXT, Parser, update_tags, VIDEO_EXT } from './shared'

var ACAC = new AbortController()

const realbooru: ServerModel = {
    name: 'realbooru',
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
        let url = 'https://realbooru.com/index.php?page=dapi&s=post'
        url += '&q=index&pid=' + page

        if (tags) url += '&tags=' + tags

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
                score: -1,
                file: file,
                parent_id: null,
                sample: post.getAttribute('sample_url')!,
                id: parseInt(post.getAttribute('id')!),
                has_children: post.getAttribute('has_children') === 'true',
                tags: post.getAttribute('tags')!.trim().split(' '),
                rating: <Rating>this.rating_table[rating_key],
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
