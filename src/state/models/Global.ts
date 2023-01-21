type Mode = 'V' | 'O' | 'I' | 'Z' | 'C'

type Global = {
    tab: 'info' | 'content'
    favorite_list: number[]
    mode: Mode
    end_page: boolean
    original: boolean
    sort_score: boolean
    isLocal: boolean
    isFullScreen: boolean
    showOverlayInfo: boolean
    showOverlayInfoTags: boolean
}

export { Global as GlobalModel, Mode }
