import React, { CSSProperties, FC, useEffect } from 'react'

import { toggle_favorite_post } from 'utils'

import { useAtomValue, useSetAtom } from 'jotai'
import { ActionsAtom, GeneralAtom, PostAtom } from 'state'

type Props = {
    show: boolean
    show_tags: boolean
}

const OverlayInfo: FC<Props> = ({ show, show_tags }) => {
    const register = useSetAtom(ActionsAtom)
    const setGeneral = useSetAtom(GeneralAtom)
    const general = useAtomValue(GeneralAtom)
    const post = useAtomValue(PostAtom)

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
                func: () => {
                    if (!post) return

                    setGeneral(async s => ({
                        favorite_list: await toggle_favorite_post(
                            s,
                            s.server.name,
                            post.id
                        ),
                    }))
                },
            },
        })
    }, [post])

    return (
        <div className='overlay_info' style={main_style}>
            <div
                className='isr'
                style={{
                    flexDirection: show_tags ? 'row' : 'column',
                }}
            >
                {post.type !== 'null' ? (
                    <>
                        <span className='type'>{post.type}</span>
                        <span className='id'>
                            {post.id}
                            {post.is_favorite ? ' 🩷' : ''}
                        </span>
                        {post.score !== -1 && (
                            <span className='score'>{post.score}</span>
                        )}
                        <span className={'rating ' + post.rating}>
                            {post.rating}
                        </span>
                        <span className='index'>
                            {general.index + 1}/{general.posts.length} |{' '}
                            {general.page}
                        </span>
                        <span className='slideshow'>N/A</span>
                    </>
                ) : (
                    <>
                        <span className='type'>N/A</span>
                        <span className='id'>N/A</span>
                        <span className='score'>N/A</span>
                        <span className='rating'>N/A</span>
                        <span className='index'>N/A</span>
                        <span className='slideshow'>N/A</span>
                    </>
                )}
            </div>
            {/* {post.type !== 'null' && post.parent && post.parent > 0 && (
                <span className='parent'>parent: {post.parent}</span>
            )} */}

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
