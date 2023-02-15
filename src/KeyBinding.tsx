import React, { FC, useEffect } from 'react'

import { get_favorite_list, now_iso } from 'utils'

import { useAtom } from 'jotai'
import {
    ActionsAtom,
    GeneralAtom,
    get_movement,
    KeyBindModel,
    Mode,
    PostAtom,
} from 'state'

const KeyBinding: FC = () => {
    const [Actions, register] = useAtom(ActionsAtom)
    const [general, setGeneral] = useAtom(GeneralAtom)
    const [post, setPost] = useAtom(PostAtom)

    const copy = (text: string | number) => {
        navigator.clipboard.writeText(`${text}`)
        setGeneral({ mode: 'V' })
    }

    useEffect(() => {
        register({
            content_movement: {
                title: 'go to the next or previous post',
                func: (_, args) => {
                    const update = get_movement(args)

                    if (general.posts.length === 0) {
                        setGeneral({ index: 0 })
                        setPost({ type: 'null', id: 0 })
                        return
                    }

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
                        setPost(general.posts[index] || { type: 'null', id: 0 })
                    }
                },
            },
        })
    }, [general])

    useEffect(() => {
        register({
            open_current_post: {
                title: 'open current post',
                func: () => {
                    if (post.type === 'null') return
                    document.dispatchEvent(ClearActiveKeys)
                    open(post.link)
                },
            },
            open_original: {
                title: 'open post original file',
                func: () => {
                    if (post.type === 'null') return
                    document.dispatchEvent(ClearActiveKeys)
                    open(post.file)
                },
            },
            download_original: {
                title: 'download original',
                func: () => {
                    if (post.type === 'null') return
                    document.dispatchEvent(ClearActiveKeys)
                    chrome.downloads.download({
                        url: post.file,
                        conflictAction: 'uniquify',
                    })
                },
            },
            copy_post_id: {
                title: 'copy post id',
                func: () => {
                    if (post.type === 'null') setGeneral({ mode: 'V' })
                    else copy(post.id)
                },
            },
            copy_parent_id: {
                title: 'copy parent id',
                func: () => {
                    if (post.type === 'null') return setGeneral({ mode: 'V' })

                    if (post.has_children) return copy(`parent:${post.id}`)
                    if (post.parent) return copy(`parent:${post.parent}`)
                },
            },
            copy_tags: {
                title: 'copy tags',
                func: () => {
                    if (post.type === 'null') setGeneral({ mode: 'V' })
                    else copy(post.tags.join(' '))
                },
            },
        })
    }, [post])

    useEffect(() => {
        register({
            set_mode: {
                title: 'set or change the mode (V, I, C, ...)',
                func: (_, args) => {
                    const mode = `${args[0]}`.toUpperCase()
                    if (check_mode(mode)) setGeneral({ mode })
                },
            },
            toggle_load_original: {
                title: 'toggle load original',
                description:
                    'the next content loads will load the original file',
                func: () => setGeneral(s => ({ original: !s.original })),
            },
            load_original: {
                title: 'load original file',
                func: () => setPost({ force_original: true }),
            },
            load_local_favorites: {
                title: 'load the local favorites. if any',
                func: async () => {
                    setGeneral(s => {
                        if (s.favorite_list.length == 0) return {}

                        setPost(s.favorite_list[0]!)

                        return {
                            end_page: true,
                            page: 0,
                            index: 0,
                            mode: 'V',
                            posts: s.favorite_list,
                        }
                    })
                },
            },
            export_local_favorites: {
                title: 'export local favorites',
                func: async () => {
                    const favorites = JSON.stringify(
                        (await chrome.storage.local.get('favorite_lists'))
                            .favorite_lists
                    )
                    const url = URL.createObjectURL(
                        new Blob([favorites], { type: 'application/json' })
                    )

                    await chrome.downloads.download({
                        url,
                        filename: `cerberus-favorites-export_${now_iso()}.json`,
                    })
                },
            },
            remove_post: {
                title: 'remove the current post',
                func: () => {
                    setGeneral(g => {
                        let idx = g.index
                        g.posts.splice(idx, 1)
                        idx--

                        if (g.posts.length == 0) {
                            g.index = 0
                            setPost({ type: 'null', id: 0 })
                            return { posts: [], index: 0 }
                        }

                        if (idx < 0) idx = g.posts.length

                        setPost(g.posts[idx]!)
                        return { index: idx, posts: g.posts }
                    })
                },
            },
        })

        setGeneral(async s => ({
            favorite_list: await get_favorite_list(s.server.name),
        }))
    }, [])

    useEffect(() => {
        // Object.keys(Actions).forEach(key => console.log(key))

        function keydown(e: KeyboardEvent) {
            ActiveKeys.set(
                e.code,
                `${e.code}-${B2B(e.altKey)}-${B2B(e.ctrlKey)}-` +
                    `${B2B(e.metaKey)}-${B2B(e.shiftKey)}`
            )

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
    }, [Actions, general])

    return <></>
}

// var ActiveKeys: { [k: string]: string } = {}
var ActiveKeys = new Map<string, string>()

document.addEventListener('clear_active_keys', () => {
    ActiveKeys.clear()
})

document.addEventListener('keyup', e => {
    ActiveKeys.delete(e.code)
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
    'V-KeyD-0-0-0-0': [['content_movement', [+1]]],
    'V-KeyA-0-0-0-0': [['content_movement', [-1]]],
    'V-KeyW-0-0-0-0': [['content_movement', [+10]]],
    'V-KeyS-0-0-0-0': [['content_movement', [-10]]],
    'V-KeyT-0-0-0-0': [['toggle_overlay_info', []]],
    'V-KeyH-0-0-0-0': [['toggle_overlay_info_tags', []]],
    'V-KeyR-0-0-0-0': [['toggle_favorite_post', []]],
    'V-KeyU-0-0-0-0': [['open_current_post', []]],
    'V-KeyY-0-0-0-0': [['toggle_load_original', []]],
    'V-KeyX-0-0-0-0': [['remove_post', []]],
    // with shift
    'V-KeyF-0-0-0-1': [['load_original', []]],
    'V-KeyN-0-0-0-1': [['open_original', []]],
    'V-KeyB-0-0-0-1': [['download_original', []]],
    'V-KeyR-0-0-0-1': [['download_original', []]],
    'V-KeyT-0-0-0-1': [['toggle_timeline', []]],
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
    'O-KeyR-0-0-0-0': [['load_local_favorites', []]],
    'O-KeyG-0-0-0-0': [['export_local_favorites', []]],
    'O-KeyH-0-0-0-0': [['import_local_favorites', []]],
    'O-KeyU-0-0-0-0': [['open_tags', []]],

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
    'Z-KeyG-0-0-0-1': [['change_zoom_speed', [-30]]],
    'Z-KeyH-0-0-0-0': [['change_zoom_speed', [+5]]],
    'Z-KeyH-0-0-0-1': [['change_zoom_speed', [+30]]],
    'Z-KeyJ-0-0-0-0': [['change_zoom_speed', [10, true]]],
    'Z-KeyT-0-0-0-0': [['toggle_overlay_info', []]],
    'Z-KeyV-0-0-0-0': [['toggle_overlay_info_tags', []]],
    'Z-KeyY-0-0-0-0': [['toggle_load_original', []]],
    'Z-KeyF-0-0-0-0': [['toggle_fullscreen', []]],
    'Z-KeyQ-0-0-0-0': [['set_mode', ['V']]],
    'Z-KeyU-0-0-0-0': [['open_current_post', []]],
    // video controls
    'Z-Space-0-0-0-0': [['toggle_video_playing', []]],
    'Z-ArrowRight-0-0-0-0': [['update_video_time', [+1]]],
    'Z-ArrowLeft-0-0-0-0': [['update_video_time', [-1]]],
    'Z-ArrowRight-0-0-0-1': [['update_video_time', [+10]]],
    'Z-ArrowLeft-0-0-0-1': [['update_video_time', [-10]]],
    'Z-ArrowUp-0-0-0-0': [['change_video_volume', [+0.05]]],
    'Z-ArrowDown-0-0-0-0': [['change_video_volume', [-0.05]]],
    'Z-KeyL-0-0-0-0': [['toggle_video_loop', []]],
    'Z-KeyM-0-0-0-0': [['toggle_video_mute', []]],

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
