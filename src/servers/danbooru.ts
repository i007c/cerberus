import axios from 'axios'

import { Rating, ServerModel } from 'state'

import { VIDEO_EXT } from './shared'

type ACT = {
    type: string
    label: string
    value: string
    category: number
    post_count: number
}

type PostData = {
    id: number
    score: number
    source: string
    md5: string
    rating: 'e'
    image_width: number
    image_height: number
    tag_string: string
    file_ext: string
    parent_id: number | null
    has_children: boolean
    tag_string_general: string
    tag_string_character: string
    tag_string_copyright: string
    tag_string_artist: string
    tag_string_meta: string
    file_url: string
    large_file_url: string
    preview_file_url: string
}

var ACAC = new AbortController()

const danbooru: ServerModel = {
    name: 'danbooru',
    limit: 500,
    sort_score: 'order:score',

    autocomplete: async function (query) {
        ACAC.abort()
        ACAC = new AbortController()

        const url = new URL('https://danbooru.donmai.us/autocomplete.json')
        url.searchParams.set('search[type]', 'tag_query')
        url.searchParams.set('search[query]', query)
        url.searchParams.set('version', '1')
        url.searchParams.set('limit', '10')

        let data: ACT[] = []

        try {
            const response = await axios.get(url.toString(), {
                signal: ACAC.signal,
            })
            data = response.data
        } catch (error) {
            return []
        }

        return data.map(({ value, post_count }) => {
            return {
                type: 'general',
                name: value,
                count: post_count,
            }
        })
    },

    async search(tags, page) {
        ACAC.abort()

        const url = new URL('https://danbooru.donmai.us/posts.json')
        url.searchParams.set('page', `${page + 1}`)
        url.searchParams.set('tags', tags)
        url.searchParams.set('limit', this.limit.toString())

        let data: PostData[] = []

        try {
            const response = await axios.get(url.toString())
            data = response.data
        } catch (error) {
            alert(error)
            return []
        }

        const rating_table: { [k: string]: Rating } = {
            q: 'questionable',
            e: 'explicit',
            s: 'safe',
        }

        // data = data.filter(({ score }) => score !== null)

        return data.map(item => {
            return {
                type: VIDEO_EXT.includes(item.file_ext) ? 'video' : 'image',
                id: item.id,
                sample: item.large_file_url,
                file: item.file_url,
                score: item.score,
                rating: rating_table[item.rating] || 'questionable',
                tags: item.tag_string.split(' '),
                parent_id: item.parent_id,
                // ------
                has_children: item.has_children,
                ext: item.file_ext,
                link: 'https://danbooru.donmai.us/posts/' + item.id,
            }
        })
    },
    open_tags(tags) {
        open('https://danbooru.donmai.us/posts?tags=' + tags)
    },
}

export { danbooru }
