import { yandere } from 'servers'

import { atom } from 'jotai'
import { PostStateModel } from 'state'

import img from 'static/patrick.jpg'
import video from 'static/sample.mp4'

const IMAGE_POST: Post = {
    type: 'image',
    ext: 'jpg',
    file: img,
    sample: img,
    has_children: false,
    id: 12,
    rating: 'safe',
    score: 10000000,
    tags: ['patrick'],
}

const VIDEO_POST: Post = {
    type: 'video',
    ext: 'mp4',
    file: video,
    sample: img,
    has_children: false,
    id: 76,
    rating: 'questionable',
    score: 6991,
    tags: ['dr_stop'],
}

IMAGE_POST
const DEFAULT_POST = VIDEO_POST

const Post = atom<PostStateModel>({
    page: 0,
    index: 0,
    post: DEFAULT_POST,
    posts: [],
    server: yandere,
    autocomplete: null,
})

const PostAtom = atom(
    get => get(Post),
    (get, set, args: Partial<PostStateModel>) => {
        set(Post, { ...get(Post), ...args })
    }
)

export { PostAtom }
