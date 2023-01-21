import React, { FC } from 'react'

const Content: FC = () => {
    return (
        <div className='content' tabIndex={0}>
            <div className='plate' tabIndex={0}>
                <img className='main' style={{ display: 'none' }} />
                <video
                    className='main'
                    style={{ display: 'none' }}
                    autoPlay
                ></video>

                <div className='volume'>
                    <div></div>
                </div>

                <div className='timeline'>
                    <div></div>
                </div>

                <div className='loading'>
                    <div></div>
                </div>

                <div className='overlay_info' style={{ display: 'none' }}>
                    <div className='isr'>
                        <span className='id'>N/A</span>
                        <span className='score'>N/A</span>
                        <span className='rating'>N/A</span>
                        <span className='index'>N/A</span>
                        <span className='slideshow'>N/A</span>
                    </div>
                    <span className='parent' style={{ display: 'none' }}>
                        parent: N/A
                    </span>
                    <div className='tags' style={{ display: 'none' }}></div>
                </div>

                <div className='slideshow_bar'>
                    <div></div>
                </div>

                <div className='zoomed-container'>
                    <canvas className='zoomed'></canvas>
                </div>
            </div>
        </div>
    )
}

export default Content
