import { PostModel, Rating, ServerModel } from 'state'

import { IMAGE_EXT, Parser, VIDEO_EXT } from './shared'

interface ACD {
    value: string
    type: string
    label: string
}

var ACAC = new AbortController()

const rule34: ServerModel = {
    name: 'rule34',
    limit: 500,
    sort_score: 'sort:score',

    async autocomplete(query) {
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
    async search(tags, page) {
        ACAC.abort()
        let url = `https://api.rule34.xxx/index.php?page=dapi&s=post&limit=${this.limit}`
        url += '&q=index&pid=' + page

        if (tags) url += '&tags=' + tags

        let text

        try {
            const response = await fetch(url)
            text = await response.text()
        } catch (error) {
            return []
        }

        if (!text) return []

        const xml = Parser.parseFromString(text, 'text/xml')
        const posts = xml.querySelector('posts')!
        const posts_list = posts.querySelectorAll('post')
        const data: PostModel[] = []

        posts_list.forEach(post => {
            const file = post.getAttribute('file_url')!

            const ext = file.split('.').at(-1) || 'png'
            let type: 'image' | 'video' = 'image'

            if (VIDEO_EXT.includes(ext)) {
                type = 'video'
            } else if (!IMAGE_EXT.includes(ext)) {
                throw Error(ext)
            }

            const rating_key = post.getAttribute('rating') || 'q'
            const rating_table: { [k: string]: Rating } = {
                q: 'questionable',
                e: 'explicit',
                s: 'safe',
            }

            const post_id = parseInt(post.getAttribute('id')!)

            data.push({
                type,
                score: parseInt(post.getAttribute('score')!),
                file: file,
                parent: parseInt(post.getAttribute('parent_id')!),
                sample: post.getAttribute('sample_url')!,
                id: post_id,
                has_children: post.getAttribute('has_children') === 'true',
                tags: post.getAttribute('tags')!.trim().split(' '),
                rating: rating_table[rating_key] || 'questionable',
                ext,
                link: `https://rule34.xxx/index.php?page=post&s=view&id=${post_id}`,
            })
        })

        return data
    },
    open_tags(tags) {
        open('https://rule34.xxx/index.php?page=post&s=list&tags=' + tags)
    },
}

export { rule34 }
