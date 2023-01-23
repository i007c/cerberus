import { yandere } from 'servers'

import { atom } from 'jotai'
import { PostModel, PostsModel } from 'state'

import img from 'static/patrick.jpg'
import video from 'static/sample.mp4'

const IMAGE_POST: PostModel = {
    type: 'image',
    ext: 'jpg',
    file: img,
    sample: img,
    has_children: false,
    id: 12,
    rating: 'safe',
    score: 10000000,
    tags: ['patrick'],
    link: 'google.com',
}

const VIDEO_POST: PostModel = {
    type: 'video',
    ext: 'mp4',
    file: video,
    sample: img,
    has_children: false,
    id: 76,
    rating: 'questionable',
    score: 6991,
    tags: ['dr_stop'],
    link: 'google.com',
}

IMAGE_POST
const DEFAULT_POST = VIDEO_POST

const Post = atom<PostModel | null>(DEFAULT_POST)

const PostAtom = atom(
    get => get(Post),
    (_, set, args: PostModel | null) => {
        set(Post, args)
    }
)

const Posts = atom<PostsModel>({
    page: 0,
    index: 0,
    posts: [],
    server: yandere,
    autocomplete: null,
})

const PostsAtom = atom(
    get => get(Posts),
    (get, set, args: Partial<PostsModel>) => {
        set(Posts, { ...get(Posts), ...args })
    }
)

export { PostAtom, PostsAtom }
