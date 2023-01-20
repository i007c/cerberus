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

var ACAC = new AbortController()

const yandere: ServerModel = {
    name: 'yandere',
    limit: 500,
    rating_table: {
        q: 'questionable',
        e: 'explicit',
        s: 'safe',
    },

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
        tags = update_tags(tags, 'order:score')
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

        data = data.filter(({ score }) => score !== null)

        return data.map(item => {
            const ext = item.file_url.split('.').at(-1) || 'png'

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
                ext,
            }
        })
    },

    open_post: post_id => {
        open('https://yande.re/post/show/' + post_id)
    },

    sync_favs: async function (local_favs) {
        const get_username = async () => {
            try {
                const user_id = await chrome.cookies.get({
                    name: 'user_id',
                    url: 'https://yande.re',
                })
                if (!user_id || !user_id.value) return null

                const response = await fetch(
                    'https://yande.re/user.json?id=' + user_id.value
                )
                const data = await response.json()
                if (!Array.isArray(data) || data.length === 0) return null

                return data[0].name as string
            } catch (error) {}

            return null
        }

        const username = await get_username()
        let page = 1
        let server_favs: number[] = []

        while (true) {
            const response = await fetch(
                `https://yande.re/post.json?tags=vote:3:${username}&page=${page}`
            )

            const data = await response.json()

            if (!Array.isArray(data))
                throw new Error('error while syncing the favs')

            if (data.length < 1) break

            data.forEach(p => server_favs.push(p.id))
            page++
        }

        // let url = `https://yande.re/post.json?limit=${this.limit}&page=${
        //     page + 1
        // }`
        console.log(local_favs)
        console.log(server_favs)

        const add_to_server = local_favs.filter(
            pid => !server_favs.includes(pid)
        )
        const add_to_local = server_favs.filter(
            pid => !local_favs.includes(pid)
        )

        // const response = await fetch(
        //     `https://yande.re/post/vote.json?id=${add_to_server[0]}&score=3`,
        //     {
        //         method: 'POST',
        //     }
        // )

        const pid = add_to_server[0]!

        const fd = new FormData()
        fd.set('id', pid.toString())
        fd.set('score', '3')

        const response = await fetch('https://yande.re/post/vote.json', {
            headers: {
                accept: 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'en,fa;q=0.9,ar;q=0.8',
                'content-type':
                    'application/x-www-form-urlencoded; charset=UTF-8',
                'sec-ch-ua':
                    '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-csrf-token':
                    '9fx54brnY6RnD1i60Te39ij8LWyuNUx_d0wZwYMjlO9ICRs3GxqgHuV2dPgw6QwHI2j-ritAJasgk_JDoJMvfg',
                'x-requested-with': 'XMLHttpRequest',
                origin: 'https://yande.re',
                referer: 'https://yande.re/post/show/971043',
            },
            referrer: 'https://yande.re/post/show/971043',
            referrerPolicy: 'strict-origin-when-cross-origin',
            body: 'id=971043&score=3',
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
        })

        console.log(response)
        console.log(response.status)
        console.log(response.statusText)
        console.log(await response.text())

        // add_to_server.forEach(pid => {
        //     try {
        //         console.log(`https://yande.re/post/vote.json?id=${pid}&score=3`)
        //     } catch (error) {}
        // })

        // vote:3:i007c order:vote

        return local_favs.concat(add_to_local)
    },
}

export { yandere }
