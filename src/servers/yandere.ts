import { Rating, ServerModel } from 'state'

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

var ACAC = new AbortController()

const yandere: ServerModel = {
    name: 'yandere',
    limit: 500,
    sort_score: 'order:score',

    autocomplete: async function (query) {
        ACAC.abort()
        ACAC = new AbortController()

        const url = `https://yande.re/tag.json?name=${query}&order=count&limit=10`

        let data: ACD[] = []

        try {
            let response = await fetch(url, { signal: ACAC.signal })
            data = await response.json()
        } catch (error) {
            return []
        }

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
        ACAC.abort()
        let url = `https://yande.re/post.json?limit=${this.limit}&page=${
            page + 1
        }`

        if (tags) url += '&tags=' + tags

        const response = await fetch(url)
        let data: PD[] = []

        try {
            data = await response.json()
        } catch (error) {
            alert(error)
        }

        const rating_table: { [k: string]: Rating } = {
            q: 'questionable',
            e: 'explicit',
            s: 'safe',
        }

        data = data.filter(({ score }) => score !== null)

        return data.map(item => {
            const ext = item.file_url.split('.').at(-1) || 'png'

            return {
                type: 'image',
                id: item.id,
                sample: item.sample_url,
                file: item.file_url,
                score: item.score,
                rating: rating_table[item.rating] || 'questionable',
                tags: item.tags.split(' '),
                parent_id: item.parent_id,
                // ------
                has_children: item.has_children,
                ext,
                link: 'https://yande.re/post/show/' + item.id,
            }
        })
    },
}

export { yandere }
