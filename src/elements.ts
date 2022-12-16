const content_tab: HTMLDivElement = document.querySelector('body > .content')!
const info_tab: HTMLDivElement = document.querySelector('body > .info')!
const inp_sort_score = document.querySelector<HTMLInputElement>(
    '#sort_score_checkbox'
)!
const tags_container = info_tab.querySelector<HTMLDivElement>('div.tags')!
const tags_input = document.querySelector('textarea')!
const autocomplete = document.querySelector<HTMLUListElement>(
    '.info ul.autocomplete'
)!
const plate = content_tab.querySelector<HTMLDivElement>('div.plate')!
const plate_image = plate.querySelector<HTMLImageElement>('img')!
const plate_video = plate.querySelector<HTMLVideoElement>('video')!

const volume_bar =
    content_tab.querySelector<HTMLDivElement>('div.volume > div')!
const timeline_bar =
    content_tab.querySelector<HTMLDivElement>('div.timeline > div')!
const slideshow_bar = content_tab.querySelector<HTMLDivElement>(
    'div.slideshow_bar > div'
)!

const server_opt = info_tab.querySelector<HTMLSelectElement>('select.server')!
const cache_posts = document.querySelector<HTMLDivElement>('#under_ground')!

const OIS = content_tab.querySelector<HTMLDivElement>('.overlay_info')!

const overlay_info = {
    self: OIS,

    isr: OIS.querySelector<HTMLDivElement>('.isr')!,
    tags: OIS.querySelector<HTMLDivElement>('.tags')!,

    parent: OIS.querySelector<HTMLSpanElement>('.parent')!,
    id: OIS.querySelector<HTMLSpanElement>('.isr .id')!,
    score: OIS.querySelector<HTMLSpanElement>('.isr .score')!,
    rating: OIS.querySelector<HTMLSpanElement>('.isr .rating')!,
    index: OIS.querySelector<HTMLSpanElement>('.isr .index')!,
    slideshow: OIS.querySelector<HTMLSpanElement>('.isr .slideshow')!,
}

export { overlay_info, tags_container, cache_posts }
export { server_opt, tags_input, autocomplete }
export { volume_bar, timeline_bar, slideshow_bar }
export { plate, plate_image, plate_video }
export { content_tab, info_tab, inp_sort_score }
