import React, { FC, useEffect } from 'react'

import { toggle_favorite_post } from 'utils'

import { useAtom } from 'jotai'
import {
    ActionsAtom,
    GeneralAtom,
    get_movement,
    KeyBindModel,
    Mode,
    PostAtom,
    SlideShowAtom,
} from 'state'

const KeyBinding: FC = () => {
    const [Actions, register] = useAtom(ActionsAtom)
    const [GeneralState, setGeneral] = useAtom(GeneralAtom)
    const [PostState, setPost] = useAtom(PostAtom)
    const [SlideShowState, setSlideShow] = useAtom(SlideShowAtom)

    global.Post = PostState
    global.SlideShow = SlideShowState
    global.general = GeneralState

    const copy = (text: string | number) => {
        navigator.clipboard.writeText(`${text}`)
        setGeneral({ mode: 'V' })
    }

    useEffect(() => {
        register({
            set_mode: {
                title: 'set or change the mode (V, I, C, ...)',
                func: (_, args) => {
                    const mode = `${args[0]}`.toUpperCase()
                    if (check_mode(mode)) setGeneral({ mode })
                },
            },
            toggle_favorite_post: {
                title: 'toggle favorite post',
                func: async () => {
                    if (Post)
                        setGeneral({
                            favorite_list: await toggle_favorite_post(
                                general.server.name,
                                Post.id
                            ),
                        })
                },
            },
            slideshow_speed: {
                title: 'update slieshow speed',
                func: (_, args) => {
                    const update = get_movement(args)

                    if (SlideShow.speed + update < 1) {
                        setSlideShow({ speed: 0.3 })
                    } else {
                        setSlideShow({
                            speed: Math.floor(SlideShow.speed + update),
                        })
                    }
                },
            },
            content_movement: {
                title: 'go to the next or previous post',
                func: (_, args) => {
                    if (general.posts.length === 0) {
                        setGeneral({ index: 0 })
                        setPost(null)
                        return
                    }

                    const update = get_movement(args)
                    let index = general.index
                    index += update

                    if (index >= general.posts.length) {
                        index = 0

                        // if (!general.isLocal && !State.end_page) {
                        //     State.page++
                        //     search()
                        //     return
                        // }
                    } else if (index < 0) {
                        index = general.posts.length - 1
                    }

                    if (index !== general.index) {
                        setGeneral({ index })
                        setPost(general.posts[index] || null)
                        setSlideShow({ pos: 0 })

                        if (SlideShow.running) {
                            setSlideShow({ running: false })
                            // SlideShow.running = false
                            // setTimeout(() => {
                            //     slideshow()
                            // }, 500)
                        }
                    }
                },
            },
            open_current_post: {
                title: 'open current post',
                func: () => {
                    if (!Post) return
                    document.dispatchEvent(ClearActiveKeys)
                    open(Post.link)
                },
            },
            toggle_load_original: {
                title: 'toggle load original',
                description:
                    'the next content loads will load the original file',
                func: () => setGeneral({ original: !general.original }),
            },
            load_original: {
                title: 'load original file',
                func: () => {
                    if (!Post) return
                    setPost({ ...Post, force_original: true })
                },
            },
            open_original: {
                title: 'open post original file',
                func: () => {
                    if (!Post) return
                    document.dispatchEvent(ClearActiveKeys)
                    open(Post.file)
                },
            },
            download_original: {
                title: 'download original',
                func: () => {
                    if (!Post) return
                    document.dispatchEvent(ClearActiveKeys)
                    chrome.downloads.download({
                        url: Post.file,
                        conflictAction: 'uniquify',
                    })
                },
            },
            copy_post_id: {
                title: 'copy post id',
                func: () => {
                    if (!Post) return setGeneral({ mode: 'V' })
                    copy(Post.id)
                },
            },
            copy_parent_id: {
                title: 'copy parent id',
                func: () => {
                    if (!Post) return setGeneral({ mode: 'V' })

                    if (Post.has_children) return copy(`parent:${Post.id}`)
                    if (Post.parent) return copy(`parent:${Post.parent}`)
                },
            },
            copy_tags: {
                title: 'copy tags',
                func: () => {
                    if (!Post) return setGeneral({ mode: 'V' })
                    copy(Post.tags.join(' '))
                },
            },
        })
    }, [register])

    useEffect(() => {
        // Object.keys(Actions).forEach(key => console.log(key))

        function keydown(e: KeyboardEvent) {
            ActiveKeys[e.code] =
                `${e.code}-${B2B(e.altKey)}-${B2B(e.ctrlKey)}-` +
                `${B2B(e.metaKey)}-${B2B(e.shiftKey)}`

            Object.values(ActiveKeys).forEach(key => {
                const keybinds = (
                    KeyBinds[`${general.mode}-${key}`] || []
                ).concat(KeyBinds[`*-${key}`] || [])

                let called = false

                keybinds.forEach(([action_key, args]) => {
                    const action = Actions[action_key]
                    if (!action) return
                    action.func(e, args)
                    called = true
                })

                if (called) {
                    e.preventDefault()
                    e.stopPropagation()
                    e.stopImmediatePropagation()
                }
            })
        }

        document.addEventListener('keydown', keydown)

        return () => {
            document.removeEventListener('keydown', keydown)
        }
    }, [Actions])

    return <></>
}

var ActiveKeys: { [k: string]: string } = {}

document.addEventListener('clear_active_keys', () => {
    ActiveKeys = {}
})

document.addEventListener('keyup', e => {
    delete ActiveKeys[e.code]
})

global.ClearActiveKeys = new CustomEvent('clear_active_keys')

const B2B = (bool: boolean) => (bool ? '1' : '0')

const Modes = ['V', 'O', 'I', 'Z', 'C']

const check_mode = (mode: string): mode is Mode => Modes.includes(mode)

const KeyBinds: { [k: string]: KeyBindModel[] } = {
    // MODE-KEY-ALT-CTRL-META-SHIFT

    // global actions
    '*-Escape-0-0-0-0': [['set_mode', ['V']]],

    // view mode
    'V-KeyI-0-0-0-0': [['set_mode', ['I']]],
    'V-KeyC-0-0-0-0': [['set_mode', ['C']]],
    'V-KeyZ-0-0-0-0': [['set_mode', ['Z']]],
    'V-KeyO-0-0-0-0': [['set_mode', ['O']]],
    'V-Space-0-0-0-0': [['toggle_video_playing', []]],
    'V-KeyF-0-0-0-0': [['toggle_fullscreen', []]],
    'V-Minus-0-0-0-0': [['slideshow_speed', [-1]]],
    'V-Digit1-0-0-0-0': [['slideshow_speed', [-1]]],
    'V-Equal-0-0-0-0': [['slideshow_speed', [1]]],
    'V-Digit3-0-0-0-0': [['slideshow_speed', [1]]],
    'V-KeyD-0-0-0-0': [['content_movement', [+1]]],
    'V-KeyA-0-0-0-0': [['content_movement', [-1]]],
    'V-KeyW-0-0-0-0': [['content_movement', [+10]]],
    'V-KeyS-0-0-0-0': [['content_movement', [-10]]],
    'V-KeyT-0-0-0-0': [['toggle_overlay_info', []]],
    'V-KeyH-0-0-0-0': [['toggle_overlay_info_tags', []]],
    'V-KeyR-0-0-0-0': [['toggle_favorite_post', []]],
    'V-KeyU-0-0-0-0': [['open_current_post', []]],
    'V-KeyY-0-0-0-0': [['toggle_load_original', []]],
    // with shift
    'V-KeyF-0-0-0-1': [['load_original', []]],
    'V-KeyN-0-0-0-1': [['open_original', []]],
    'V-KeyB-0-0-0-1': [['download_original', []]],
    'V-KeyR-0-0-0-1': [['download_original', []]],
    // video controls
    'V-ArrowRight-0-0-0-0': [['update_video_time', [+1]]],
    'V-ArrowLeft-0-0-0-0': [['update_video_time', [-1]]],
    'V-KeyD-0-0-0-1': [['update_video_time', [+10]]],
    'V-KeyA-0-0-0-1': [['update_video_time', [-10]]],
    'V-ArrowUp-0-0-0-0': [['change_video_volume', [+0.05]]],
    'V-ArrowDown-0-0-0-0': [['change_video_volume', [-0.05]]],
    'V-KeyL-0-0-0-0': [['toggle_video_loop', []]],
    'V-KeyM-0-0-0-0': [['toggle_video_mute', []]],

    // options mode
    'O-Enter-0-0-0-0': [['search', []]],
    'O-KeyI-0-0-0-0': [['set_mode', ['I']]],
    'O-KeyF-0-0-0-0': [['select_localfile', []]],
    'O-KeyS-0-0-0-0': [['toggle_sort_score', []]],
    'O-KeyD-0-0-0-0': [['change_server', [+1]]],
    'O-KeyA-0-0-0-0': [['change_server', [-1]]],

    // insert mode
    'I-Enter-0-0-0-0': [['search', []]],
    'I-Tab-0-0-0-0': [['autocomplete_select', []]],

    // copy mode
    'C-KeyI-0-0-0-0': [['copy_post_id', []]],
    'C-KeyP-0-0-0-0': [['copy_parent_id', []]],
    'C-KeyT-0-0-0-0': [['copy_tags', []]],

    // zoom mode
    'Z-KeyD-0-0-0-0': [['change_zoom_pos', ['x', +1]]],
    'Z-KeyA-0-0-0-0': [['change_zoom_pos', ['x', -1]]],
    'Z-KeyW-0-0-0-0': [['change_zoom_pos', ['y', -1]]],
    'Z-KeyS-0-0-0-0': [['change_zoom_pos', ['y', +1]]],
    'Z-KeyG-0-0-0-0': [['change_zoom_speed', [-5]]],
    'Z-KeyH-0-0-0-0': [['change_zoom_speed', [+5]]],
    'Z-KeyJ-0-0-0-0': [['change_zoom_speed', [10, true]]],
    'Z-KeyT-0-0-0-0': [['toggle_overlay_info', []]],
    'Z-KeyV-0-0-0-0': [['toggle_overlay_info_tags', []]],
    'Z-KeyY-0-0-0-0': [['toggle_load_original', []]],
    'Z-KeyF-0-0-0-0': [['toggle_fullscreen', []]],
    'Z-KeyQ-0-0-0-0': [['set_mode', ['V']]],
    'Z-KeyU-0-0-0-0': [['open_current_post', []]],

    'Z-Minus-0-0-0-0': [['change_zoom_level', [-1]]],
    'Z-Digit1-0-0-0-0': [['change_zoom_level', [-1]]],
    'Z-Equal-0-0-0-0': [['change_zoom_level', [+1]]],
    'Z-Digit3-0-0-0-0': [['change_zoom_level', [+1]]],
    'Z-Digit4-0-0-0-0': [['set_zoom_comic', []]],
    'Z-Digit5-0-0-0-0': [['change_zoom_pos', ['y', 0, true]]],
    'Z-KeyZ-0-0-0-0': [['change_zoom_level', [10, true]]],
    'Z-Digit0-0-0-0-0': [['change_zoom_level', [10, true]]],
    'Z-Digit2-0-0-0-0': [['change_zoom_level', [10, true]]],

    'Z-KeyD-0-0-0-1': [['content_movement', [+1]]],
    'Z-KeyA-0-0-0-1': [['content_movement', [-1]]],
    'Z-KeyF-0-0-0-1': [['load_original', []]],
}

export { KeyBinding }
