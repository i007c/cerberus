import { inp_sort_score } from 'elements'

const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif']
const VIDEO_EXT = ['mp4', 'webm']
const Parser = new DOMParser()

const update_tags = (tags: string, ss_tag: string) => {
    if (inp_sort_score.checked && ss_tag) tags += ' ' + ss_tag

    return tags
}

export { update_tags, VIDEO_EXT, IMAGE_EXT, Parser }
