import { ServerModel } from 'state'

import data from './pornpen.data.json'

const pornpen: ServerModel = {
    name: 'pornpen',
    limit: 500,
    sort_score: 'order:score',

    autocomplete: async function (_) {
        return []
    },

    search: async function (_t, page) {
        if (page > 0) return []

        return data.map((item, idx) => {
            return {
                type: 'image',
                id: idx,
                sample: item.imageUrl,
                file: item.imageUrl,
                score: -1,
                rating: 'questionable',
                tags: [],
                // ------
                has_children: false,
                ext: 'png',
                link: 'https://pornpen.ai/view/' + item.imageId,
            }
        })
    },
    open_tags(_) {},
}

export { pornpen }
