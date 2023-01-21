import React, { FC } from 'react'

const Info: FC = () => {
    return (
        <div className='info' tabIndex={0}>
            <div className='inner-info'>
                <div className='tags' style={{ display: 'none' }}></div>
                <textarea tabIndex={0}></textarea>
                <ul className='autocomplete' style={{ display: 'none' }}></ul>
                <div className='checkbox-row'>
                    <input type='checkbox' id='sort_score_checkbox' />
                    <label htmlFor='sort_score_checkbox'>Sort:Score</label>
                </div>

                <select className='server' defaultValue='yandere'>
                    <option value='rule34'>Rule 34</option>
                    <option value='yandere'>Yandere</option>
                    <option value='realbooru'>Real Booru</option>
                    <option value='danbooru'>Dan Booru</option>
                    <option value='gelbooru'>Gel Booru</option>
                </select>

                <input type='file' className='local-file' />
            </div>
        </div>
    )
}

export default Info
