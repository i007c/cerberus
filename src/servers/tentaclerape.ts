import { AutoCompleteTag, PostModel, ServerModel } from 'state'

import { Parser } from './shared'
import tags from './tentaclerape.tags.json'

const BASE = 'https://tentaclerape.net'

const tentaclerape: ServerModel = {
    name: 'tentaclerape',
    limit: 500,
    sort_score: 'order:score',

    autocomplete: async query => {
        if (!query) return []

        let ac: AutoCompleteTag[] = []

        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i]!
            if (tag.name.indexOf(query) !== -1) {
                ac.push({ ...tag, type: 'general' })
                if (ac.length > 9) return ac
            }
        }

        return ac
    },

    search: async function (tags, page) {
        const url = `${BASE}/post/list/${tags}/${page + 1}`

        let text

        try {
            const response = await fetch(url)
            if (response.status != 200) return []
            text = await response.text()
        } catch (error) {
            return []
        }

        if (!text) return []

        const html = Parser.parseFromString(text, 'text/html')

        const list = html.querySelectorAll('div.shm-image-list > a')

        const data: PostModel[] = []

        list.forEach(e => {
            const id = parseInt(e.getAttribute('data-post-id')!)
            const tags = e.getAttribute('data-tags')!.split(' ')
            const is_video = !!tags.find(i =>
                ['video', 'webm', 'mp4'].includes(i)
            )

            data.push({
                id,
                link: BASE + e.getAttribute('href'),
                file: `${BASE}/index.php?q=/image/${id}`,
                sample: BASE + e.querySelector('img')!.getAttribute('src'),
                ext: 'png',
                has_children: false,
                rating: 'explicit',
                score: -1,
                tags,
                type: is_video ? 'video' : 'image',
            })
        })

        return data
    },
    open_tags(tags) {
        open('https://tentaclerape.net/post/list/' + tags + '/1')
    },
}

export { tentaclerape }
