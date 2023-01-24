async function load_favorite_list(server: string): Promise<number[]> {
    let db = await chrome.storage.local.get('favorite_lists')

    if (db.favorite_lists === undefined) {
        await chrome.storage.local.set({ favorite_lists: { [server]: [] } })
        return []
    }

    if (db.favorite_lists[server] === undefined) {
        await chrome.storage.local.set({
            favorite_lists: {
                ...db.favorite_lists,
                [server]: [],
            },
        })

        return []
    }

    return db.favorite_lists[server]
}

async function toggle_favorite_post(
    server: string,
    post_id: number
): Promise<number[]> {
    if (general.isLocal) return general.favorite_list

    let db = await chrome.storage.local.get('favorite_lists')

    if (
        db.favorite_lists === undefined ||
        db.favorite_lists[server] === undefined
    ) {
        return general.favorite_list
    }

    let deleted = false

    let fav_list = general.favorite_list.filter(pid => {
        if (pid === post_id) {
            deleted = true
            return false
        }

        return true
    })

    if (!deleted) {
        fav_list.push(post_id)
    }

    await chrome.storage.local.set({
        favorite_lists: {
            ...db.favorite_lists,
            [server]: fav_list,
        },
    })

    return fav_list
}

export { toggle_favorite_post, load_favorite_list }
