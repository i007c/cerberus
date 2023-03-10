import axios from 'axios'

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

        tags.forEach(tag => {
            if (tag.name.indexOf(query) !== -1) {
                ac.push(tag)
                if (ac.length > 9) return
            }
        })

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
            let ext = 'png'
            if (is_video) ext = 'mp4'
            else if (tags.includes('animated')) ext = 'gif'

            data.push({
                id,
                link: BASE + e.getAttribute('href'),
                file: `${BASE}/index.php?q=/image/${id}`,
                sample: BASE + e.querySelector('img')!.getAttribute('src'),
                ext,
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

const get_tags = async () => {
    const pattern = new RegExp(/.+\((\d+)\)/)
    const url = 'https://tentaclerape.net/tags/popularity'

    const response = await axios.get(url)
    const data = Parser.parseFromString(response.data, 'text/html')
    const tags: AutoCompleteTag[] = []

    data.querySelector('#Tagsmain div.blockbody')!
        .querySelectorAll('a')
        .forEach(a => {
            const count = parseInt(a.text.match(pattern)![1]!)
            const name = a.getAttribute('href')!.slice(11, -2)

            tags.push({
                name: name.toLowerCase(),
                type: 'general',
                count,
            })
        })

    const tags_url = URL.createObjectURL(
        new Blob([JSON.stringify(tags)], { type: 'application/json' })
    )

    await chrome.downloads.download({
        url: tags_url,
        filename: `tentaclerape.tags.json`,
    })
}

export { tentaclerape, get_tags }
