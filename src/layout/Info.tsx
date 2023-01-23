import React, { FC, useEffect, useRef, useState } from 'react'

import { SERVERS } from 'servers'
import { VIDEO_EXT } from 'servers/shared'
import { load_favorite_list } from 'utils'

import { useSetAtom } from 'jotai'
import {
    ActionsAtom,
    get_movement,
    PostAtom,
    PostModel,
    PostsAtom,
} from 'state'

const Info: FC = () => {
    const register = useSetAtom(ActionsAtom)
    const setPosts = useSetAtom(PostsAtom)
    const setPost = useSetAtom(PostAtom)
    const [state, setState] = useState({
        sort_score: false,
    })

    const local_file = useRef<HTMLInputElement>(null)
    const server = useRef<HTMLSelectElement>(null)

    useEffect(() => {
        register({
            select_localfile: {
                title: 'select a local json file',
                func: () => {
                    if (!local_file.current) return
                    document.dispatchEvent(ClearActiveKeys)

                    local_file.current.click()
                    general.mode = 'V'
                },
            },
            toggle_sort_score: {
                title: 'toggle sort score',
                func: () => {
                    general.sort_score = !general.sort_score
                    setState(s => ({ ...s, sort_score: general.sort_score }))
                },
            },
            change_server: {
                title: 'change server',
                func: (_, args) => {
                    if (!server.current) return
                    const update = get_movement(args)
                    const servers = Object.values(SERVERS)
                    let idx = server.current.selectedIndex + update

                    if (idx >= servers.length) idx = 0
                    if (idx < 0) idx = servers.length - 1

                    const new_server = servers[idx]!

                    server.current.value = new_server.name
                    setPosts({ server: new_server })
                    load_favorite_list(new_server.name)
                },
            },
        })
    }, [register])

    return (
        <div className='info' tabIndex={0}>
            <div className='inner-info'>
                <div className='tags' style={{ display: 'none' }}></div>
                <textarea
                    tabIndex={0}
                    onInput={e => {
                        let last_tag = e.currentTarget.value.split(' ').at(-1)
                        console.log(last_tag)
                        // e.currentTarget.value = e.currentTarget.value.replaceAll('\n', '')

                        // if (!last_tag || last_tag === '\n') return update_autocomplete([])

                        // if (State.server.autocomplete) {
                        //     const data = await State.server.autocomplete(last_tag)
                        //     update_autocomplete(data)
                        // }
                    }}
                ></textarea>
                <ul className='autocomplete' style={{ display: 'none' }}></ul>
                <div className='checkbox-row'>
                    <input
                        checked={state.sort_score}
                        type='checkbox'
                        id='sort_score_checkbox'
                        onChange={() => {}}
                    />
                    <label htmlFor='sort_score_checkbox'>Sort:Score</label>
                </div>

                <select
                    ref={server}
                    className='server'
                    defaultValue='yandere'
                    onChange={e => {
                        // @ts-ignore
                        const new_server = SERVERS[e.currentTarget.value]
                        setPosts({ server: new_server })
                        load_favorite_list(new_server.name)
                    }}
                >
                    {Object.keys(SERVERS).map(key => (
                        <option key={key} value={key}>
                            {key.replaceAll('_', ' ')}
                        </option>
                    ))}
                </select>

                <input
                    ref={local_file}
                    type='file'
                    className='local-file'
                    onChange={async e => {
                        const file =
                            e.currentTarget.files && e.currentTarget.files[0]
                        if (!file || file.type !== 'application/json') return

                        const data = JSON.parse(await file.text())

                        general.isLocal = true

                        const posts: PostModel[] = data.favorites.map(
                            (f: any) => ({
                                ext: f.file.ext,
                                file: f.file.url,
                                has_children: f.has_children,
                                id: parseInt(f.ppostId),
                                parent_id: f.parent_id
                                    ? parseInt(f.parent_id)
                                    : null,
                                sample: f.sample.url,
                                score: f.score,
                                tags: f.tags.split(' '),
                                type: VIDEO_EXT.includes(f.file.ext)
                                    ? 'video'
                                    : 'image',
                                // @ts-ignore
                                rating: RATING_TABLE[`${f.rating}`],
                            })
                        )

                        setPosts({ posts })

                        if (posts[0]) setPost(posts[0])
                    }}
                />
            </div>
        </div>
    )
}

const RATING_TABLE = {
    q: 'questionable',
    e: 'explicit',
    s: 'safe',
}

export default Info
