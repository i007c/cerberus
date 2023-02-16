import { SERVERS } from 'servers'

import { GeneralModel, PostModel } from 'state'

;(async () => {
    let db = (await chrome.storage.local.get('favorite_lists')).favorite_lists

    if (typeof db !== 'object' || db === null) db = {}

    Object.values(SERVERS).map(server => {
        if (!Array.isArray(db[server.name])) {
            db[server.name] = []
        }
    })

    await chrome.storage.local.set({
        favorite_lists: db,
    })
})()

async function get_favorite_list(server: string): Promise<PostModel[]> {
    return (await chrome.storage.local.get('favorite_lists')).favorite_lists[
        server
    ]
}

const is_favorite = (general: GeneralModel, id: number) =>
    !!general.favorite_list.find(v => v.id == id)

export { is_favorite, get_favorite_list }
