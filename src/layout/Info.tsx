import React, { FC, Fragment, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import { SERVERS } from 'servers'
import { VIDEO_EXT } from 'servers/shared'
import { get_favorite_list, is_post } from 'utils'

import { useAtom, useSetAtom } from 'jotai'
import {
    ActionsAtom,
    AutoCompleteAtom,
    GeneralAtom,
    get_movement,
    PostAtom,
    PostModel,
} from 'state'

const Info: FC = () => {
    const register = useSetAtom(ActionsAtom)
    const [AutoComplete, setAutoComplete] = useAtom(AutoCompleteAtom)

    const setPost = useSetAtom(PostAtom)
    const [general, setGeneral] = useAtom(GeneralAtom)

    const [state, updateState] = useState({
        input: [] as string[],
        ac_index: -1,
    })

    const setState = (args: Partial<typeof state>) =>
        updateState(s => ({ ...s, ...args }))

    const local_file = useRef<HTMLInputElement>(null)
    const import_file = useRef<HTMLInputElement>(null)
    const server = useRef<HTMLSelectElement>(null)
    const input = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        register({
            select_localfile: {
                title: 'select a local json file',
                func: () => {
                    if (!local_file.current) return
                    document.dispatchEvent(ClearActiveKeys)

                    local_file.current.click()
                    setGeneral({ mode: 'V' })
                },
            },
            toggle_sort_score: {
                title: 'toggle sort score',
                func: () => setGeneral(s => ({ sort_score: !s.sort_score })),
            },
            change_server: {
                title: 'change server',
                func: async (_, args) => {
                    if (!server.current) return
                    const update = get_movement(args)
                    const servers = Object.values(SERVERS)
                    let idx = server.current.selectedIndex + update

                    if (idx >= servers.length) idx = 0
                    if (idx < 0) idx = servers.length - 1

                    const new_server = servers[idx]!

                    server.current.value = new_server.name
                    setGeneral({
                        server: new_server,
                        favorite_list: await get_favorite_list(new_server.name),
                    })
                },
            },
            import_local_favorites: {
                title: 'import local favorites',
                func: async () => {
                    if (!import_file.current) return
                    document.dispatchEvent(ClearActiveKeys)

                    import_file.current.click()
                },
            },
        })
    }, [])

    useEffect(() => {
        register({
            autocomplete_select: {
                title: 'select the autocomplete',
                func: () =>
                    updateState(state => {
                        if (
                            AutoComplete.tags.length < 1 ||
                            AutoComplete.index === -1 ||
                            state.ac_index === -1 ||
                            state.input.length < 1
                        )
                            return state

                        let tag = AutoComplete.tags[AutoComplete.index]
                        setAutoComplete({ index: -1, tags: [] })

                        if (!tag) return state

                        const new_state = {
                            input: state.input.map((stag, idx) => {
                                if (idx === state.ac_index && tag)
                                    return tag.name
                                return stag
                            }),
                            ac_index: -1,
                        }

                        if (input.current)
                            input.current.value = new_state.input.join(' ')

                        return new_state
                    }),
            },
        })
    }, [AutoComplete])

    useEffect(() => {
        if (!input.current) return

        if (general.mode === 'I') {
            input.current.focus()
        } else {
            setAutoComplete({ index: -1, tags: [] })
            input.current.blur()
        }

        register({
            search: {
                title: 'search the tags',
                func: async () => {
                    if (!input.current) return

                    setAutoComplete({ index: -1, tags: [] })
                    setGeneral({
                        end_page: false,
                        mode: 'V',
                        index: 0,
                        page: 0,
                    })

                    let tags = input.current.value

                    if (general.sort_score) {
                        tags += ' ' + general.server.sort_score
                    }

                    let new_posts = await general.server.search(tags, 0)

                    setGeneral({ posts: new_posts })
                    setPost(new_posts[0] || { type: 'null', id: 0 })
                },
            },
            open_tags: {
                title: 'open search tags',
                func: () => {
                    if (!input.current) return

                    document.dispatchEvent(ClearActiveKeys)

                    let tags = input.current.value

                    if (general.sort_score) {
                        tags += ' ' + general.server.sort_score
                    }

                    general.server.open_tags(tags)
                },
            },
        })
    }, [general])

    return (
        <div
            className={'info' + C(['I', 'O'].includes(general.mode))}
            tabIndex={0}
        >
            <div className='inner-info'>
                <div className='tags' style={{ display: 'none' }}></div>
                <textarea
                    ref={input}
                    tabIndex={0}
                    onInput={async e => {
                        let new_tags = e.currentTarget.value
                            .split(' ')
                            .filter(v => v)

                        let changing = ''

                        if (new_tags.length != state.input.length) {
                            changing = new_tags.at(-1) || ''
                            let idx = new_tags.indexOf(changing)
                            setState({
                                ac_index: idx === undefined ? -1 : idx,
                            })
                        } else {
                            for (let i = 0; i < new_tags.length; i++) {
                                if (new_tags[i] !== state.input[i]) {
                                    changing = new_tags[i] || ''
                                    setState({ ac_index: i })
                                    break
                                }
                            }
                        }

                        setState({ input: new_tags })

                        if (!general.server.autocomplete || !changing) return

                        setAutoComplete({
                            tags: await general.server.autocomplete(changing),
                            query: changing,
                            regQuery: new RegExp(
                                `(${changing.replace(
                                    /[.*+?^${}()|[\]\\]/g,
                                    '\\$&'
                                )})`,
                                'gi'
                            ),
                        })
                    }}
                ></textarea>
                {AutoComplete.tags.length > 0 && (
                    <ul className='autocomplete'>
                        {AutoComplete.tags.map(({ type, name, count }, idx) => (
                            <li
                                className={type + C(AutoComplete.index === idx)}
                                key={idx + name}
                            >
                                <span className='name'>
                                    {name
                                        .split(AutoComplete.regQuery)
                                        .map((s, sidx) => (
                                            <Fragment key={sidx}>
                                                {s.toLocaleLowerCase() ===
                                                AutoComplete.query ? (
                                                    <mark>{s}</mark>
                                                ) : (
                                                    s
                                                )}
                                            </Fragment>
                                        ))}
                                </span>
                                <span className='count'>
                                    {count === -1 ? '' : count.toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className='checkbox-row'>
                    <input
                        checked={general.sort_score}
                        type='checkbox'
                        id='sort_score_checkbox'
                        onChange={() => {}}
                    />
                    <label htmlFor='sort_score_checkbox'>Sort:Score</label>
                </div>

                <select
                    ref={server}
                    className='server'
                    defaultValue={Object.keys(SERVERS)[0]}
                    onChange={async e => {
                        // @ts-ignore
                        const new_server = SERVERS[e.currentTarget.value]
                        setGeneral({
                            server: new_server,
                            favorite_list: await get_favorite_list(
                                new_server.name
                            ),
                        })
                    }}
                >
                    {Object.keys(SERVERS).map(key => (
                        <option key={key} value={key}>
                            {key
                                .replaceAll('_', ' ')
                                .replaceAll('booru', ' booru')}
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

                        await setGeneral(async s => ({
                            end_page: true,
                            page: 0,
                            posts,
                            favorite_list: await get_favorite_list(
                                s.server.name
                            ),
                        }))

                        if (posts[0]) setPost(posts[0])
                    }}
                />
                <input
                    ref={import_file}
                    type='file'
                    className='local-file'
                    onChange={async e => {
                        const file =
                            e.currentTarget.files && e.currentTarget.files[0]
                        if (!file || file.type !== 'application/json') return

                        const data = JSON.parse(await file.text())
                        const favorites = (
                            await chrome.storage.local.get('favorite_lists')
                        ).favorite_lists

                        Object.entries<PostModel[]>(favorites).forEach(
                            ([key, value]) => {
                                const posts = data[key]
                                if (!Array.isArray(posts)) return

                                favorites[key] = value.concat(
                                    posts.filter(post => {
                                        if (!is_post(post)) return false

                                        return (
                                            value.find(
                                                p => p.id === post.id
                                            ) === undefined
                                        )
                                    })
                                )
                            }
                        )

                        await chrome.storage.local.set({
                            favorite_lists: favorites,
                        })

                        if (import_file.current) {
                            import_file.current.value = ''
                        }
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
