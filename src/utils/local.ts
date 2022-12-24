import { State } from 'globals'
import { VIDEO_EXT } from 'servers/shared'
import { render_content } from './base'

const RATING_TABLE = {
    q: 'questionable',
    e: 'explicit',
    s: 'safe',
}

function load_from_local(data: any) {
    State.isLocal = true

    State.posts = data.favorites.map((f: any) => ({
        ext: f.file.ext,
        file: f.file.url,
        has_children: f.has_children,
        id: parseInt(f.ppostId),
        parent_id: f.parent_id ? parseInt(f.parent_id) : null,
        sample: f.sample.url,
        score: f.score,
        tags: f.tags.split(' '),
        type: VIDEO_EXT.includes(f.file.ext) ? 'video' : 'image',
        // @ts-ignore
        rating: RATING_TABLE[`${f.rating}`],
    }))

    State.post = State.posts[0]!
    render_content()
}

export { load_from_local }
