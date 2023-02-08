import React, { CSSProperties, FC, useEffect } from 'react'

import { C } from '@00-team/utils'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
    ActionsAtom,
    GeneralAtom,
    PostAtom,
    PostModel,
    SlideShowAtom,
} from 'state'

type Props = {
    show: boolean
    show_tags: boolean
}

const OverlayInfo: FC<Props> = ({ show, show_tags }) => {
    const register = useSetAtom(ActionsAtom)
    const setGeneral = useSetAtom(GeneralAtom)
    const general = useAtomValue(GeneralAtom)
    const [post, setPost] = useAtom(PostAtom)
    const slideshow = useAtomValue(SlideShowAtom)

    const main_style: CSSProperties = {
        display: show ? '' : 'none',
        borderColor:
            general.original || (post && post.force_original)
                ? '#143fb4'
                : '#b40a1b',
    }

    useEffect(() => {
        register({
            toggle_favorite_post: {
                title: 'toggle favorite post',
                func: async () => {
                    if (post.type === 'null' || !post.id) return

                    let db: { [k: string]: PostModel[] } = {}

                    db = (await chrome.storage.local.get('favorite_lists'))
                        .favorite_lists

                    db[general.server.name] = db[general.server.name]!.filter(
                        p => p.id !== post.id
                    )

                    if (!post.is_favorite) {
                        db[general.server.name]!.push(post)
                    }

                    await chrome.storage.local.set({
                        favorite_lists: db,
                    })

                    setGeneral({ favorite_list: db[general.server.name] })
                    setPost({ is_favorite: !post.is_favorite })
                },
            },
        })
    }, [general, post])

    return (
        <div className='overlay_info' style={main_style}>
            <div
                className='isr'
                style={{
                    flexDirection: show_tags ? 'row' : 'column',
                }}
            >
                {post.type !== 'null' && (
                    <>
                        <span className='type'>
                            {post.type}/{post.ext}
                        </span>
                        <span className='id'>
                            {post.id}
                            {post.is_favorite ? ' 🩷' : ''}
                        </span>
                        {post.parent ? (
                            <span className='parent'>
                                parent: {post.parent}
                            </span>
                        ) : (
                            <></>
                        )}
                        {post.score !== -1 && (
                            <span className='score'>{post.score}</span>
                        )}
                        <span className={'rating ' + post.rating}>
                            {post.rating}
                        </span>
                    </>
                )}

                <span className='index'>
                    {general.index + 1}/{general.posts.length} | {general.page}
                </span>
                <span className={'slideshow' + C(slideshow_running, 'running')}>
                    {slideshow.speed}
                </span>
            </div>

            {show_tags && post.type !== 'null' && (
                <div className='tags'>
                    {post.tags.map(tag => (
                        <span
                            key={tag}
                            onClick={() => navigator.clipboard.writeText(tag)}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

export { OverlayInfo }
