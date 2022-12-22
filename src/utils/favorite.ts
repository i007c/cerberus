import { PostModel } from 'types'

interface FavPost extends PostModel {
    server: string
}

async function toggle_favorite_post(post: FavPost) {
    let db = await chrome.storage.local.get('favorite_list')

    if (db.favorite_list === undefined) {
        await chrome.storage.local.set({ favorite_list: [post] })
        return
    }

    let list: FavPost[] = db.favorite_list
    let deleted = false

    list = list.filter(p => {
        if (typeof p !== 'object') return false

        if (p.id === post.id && p.server === post.server) {
            deleted = true
            return false
        }

        return true
    })

    if (!deleted) list.push(post)

    await chrome.storage.local.set({ favorite_list: list })
}

export { toggle_favorite_post }
