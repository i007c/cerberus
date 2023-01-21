async function load_favorite_list(server: string) {
    let db = await chrome.storage.local.get('favorite_lists')

    if (db.favorite_lists === undefined) {
        setGlobalState({ favorite_list: [] })

        await chrome.storage.local.set({ favorite_lists: { [server]: [] } })
    } else if (db.favorite_lists[server] === undefined) {
        setGlobalState({ favorite_list: [] })

        await chrome.storage.local.set({
            favorite_lists: {
                ...db.favorite_lists,
                [server]: [],
            },
        })
    } else {
        setGlobalState({ favorite_list: db.favorite_lists[server] })
    }
}

async function toggle_favorite_post(server: string, post_id: number) {
    if (GlobalState.isLocal) return

    let db = await chrome.storage.local.get('favorite_lists')

    if (
        db.favorite_lists === undefined ||
        db.favorite_lists[server] === undefined
    ) {
        return
    }

    let deleted = false

    let fav_list = GlobalState.favorite_list.filter(pid => {
        if (pid === post_id) {
            deleted = true
            return false
        }

        return true
    })

    if (!deleted) {
        fav_list.push(post_id)
    }

    setGlobalState({
        favorite_list: fav_list,
    })
    await chrome.storage.local.set({
        favorite_lists: {
            ...db.favorite_lists,
            [server]: fav_list,
        },
    })
}

export { toggle_favorite_post, load_favorite_list }
