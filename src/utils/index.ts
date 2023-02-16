import { PostModel } from 'state'

// export * from './base'
export * from './favorite'
export { now_iso, is_post }
// export * from './local'
// export * from './options'
// export * from './video'
// export * from './zoom'

const now_iso = () => {
    const date = new Date()
    let out = ''

    out += date.getFullYear() + '-'
    out += date.getMonth() + '-'
    out += date.getDate() + '_'

    out += date.getHours() + '-'
    out += date.getMinutes() + '-'
    out += date.getSeconds() + '-'
    out += date.getMilliseconds()

    return out
}

const is_post = (post: unknown): post is PostModel => {
    if (typeof post !== 'object') return false
    if (post === null) return false

    if (!('type' in post) || (post.type !== 'image' && post.type !== 'video'))
        return false
    if (!('id' in post) || typeof post.id !== 'number') return false
    if (!('has_children' in post) || typeof post.has_children !== 'boolean')
        return false
    if (!('tags' in post) || !Array.isArray(post.tags)) return false
    if (!('rating' in post) || typeof post.rating !== 'string') return false
    if (!('ext' in post) || typeof post.ext !== 'string') return false
    if (!('score' in post) || typeof post.score !== 'number') return false
    if (!('file' in post) || typeof post.file !== 'string') return false
    if (!('sample' in post) || typeof post.sample !== 'string') return false
    if (!('link' in post) || typeof post.link !== 'string') return false

    return true
}
