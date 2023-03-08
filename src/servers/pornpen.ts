import { ServerModel } from 'state'

import data from './pornpen.data.json'

/*

g = []; document.querySelector("#root > div > div.text-white.w-full > div.infinite-scroll-component__outerdiv > div > div.flex.flex-wrap.justify-center").querySelectorAll('a').forEach(a => {g.push({link: a.href,image: a.children[0].src})}); g

*/

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
                sample: item.image,
                file: item.image,
                score: -1,
                rating: 'questionable',
                tags: [],
                has_children: false,
                ext: 'png',
                link: item.link,
            }
        })
    },
    open_tags(_) {},
}

export { pornpen }
