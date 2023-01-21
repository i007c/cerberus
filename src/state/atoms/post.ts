import { atom } from 'jotai'
import { PostModel } from 'state'
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
}

IMAGE_POST
const DEFAULT_POST = VIDEO_POST

const Post = atom<PostModel>(DEFAULT_POST)

const PostAtom = atom(get => get(Post))

export { PostAtom }
