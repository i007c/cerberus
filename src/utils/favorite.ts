import { overlay_info } from 'elements'
import { State } from 'globals'

async function load_favorite_list(server: string) {
    let db = await chrome.storage.local.get('favorite_lists')

    if (db.favorite_lists === undefined) {
        State.favorite_list = []
        await chrome.storage.local.set({ favorite_lists: { [server]: [] } })
    } else if (db.favorite_lists[server] === undefined) {
        State.favorite_list = []
        await chrome.storage.local.set({
            favorite_lists: {
                ...db.favorite_lists,
                [server]: [],
            },
        })
    } else {
        State.favorite_list = db.favorite_lists[server]
    }
}

async function toggle_favorite_post(server: string, post_id: number) {
    if (State.isLocal) return

    let db = await chrome.storage.local.get('favorite_lists')

    if (
        db.favorite_lists === undefined ||
        db.favorite_lists[server] === undefined
    ) {
        return
    }

    let deleted = false

    State.favorite_list = State.favorite_list.filter(pid => {
        if (pid === post_id) {
            deleted = true
            return false
        }

        return true
    })

    if (!deleted) {
        State.favorite_list.push(post_id)
        overlay_info.id.innerText = `${post_id} 🩷`
    } else {
        overlay_info.id.innerText = `${post_id}`
    }

    await chrome.storage.local.set({
        favorite_lists: {
            ...db.favorite_lists,
            [server]: State.favorite_list,
        },
    })
}

export { toggle_favorite_post, load_favorite_list }
