import { atom } from 'jotai'
import { PostModel } from 'state'
import img from 'static/patrick.jpg'

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
}

const DEFAULT_POST = IMAGE_POST

const Post = atom<PostModel>(DEFAULT_POST)

const PostAtom = atom(get => get(Post))

export { PostAtom }
