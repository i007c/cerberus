import { update_tags } from './shared'

import { ServerModel } from 'types'

interface ACD {
    name: string
    type: string
    count: number
}

interface PD {
    score: number
    id: number
    sample_url: string
    file_url: string
    tags: string
    parent_id: number | null
    rating: 'q' | 's' | 'e'
    has_children: boolean
}

const TAGS_TABLE = {
    0: 'general',
    1: 'artist',
    3: 'copyright',
    4: 'character',
    5: 'circle',
    6: 'faults',
}

const yandere: ServerModel = {
    rating_table: {
        q: 'questionable',
        e: 'explicit',
        s: 'safe',
    },

    autocomplete: async function (query) {
        const url = `https://yande.re/tag.json?name=${query}&order=count&limit=10`
        const response = await fetch(url)

        let data: ACD[] = await response.json()

        return data.map(({ name, count, type }) => {
            return {
                // @ts-ignore
                type: TAGS_TABLE[type],
                name,
                count,
            }
        })
    },

    search: async function (tags, page) {
        tags = update_tags([...tags], 'order:score')
        let url = 'https://yande.re/post.json?limit=100&page=' + (page + 1)

        if (tags.length > 0) {
            url += '&tags=' + tags.join(' ')
        }

        const response = await fetch(url)
        let data: PD[] = []

        try {
            data = await response.json()
        } catch (error) {
            alert(error)
        }

        data = data.filter(({ score }) => score !== null)

        return data.map(item => {
            return {
                type: 'image',
                id: item.id,
                sample: item.sample_url,
                file: item.file_url,
                score: item.score,
                rating: this.rating_table[item.rating]!,
                tags: item.tags.split(' '),
                parent_id: item.parent_id,
                // ------
                has_children: item.has_children,
            }
        })
    },
    open_post: post_id => {
        open('https://yande.re/post/show/' + post_id)
    },
}

export { yandere }
