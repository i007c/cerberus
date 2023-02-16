import { ServerModel } from 'state'

import { danbooru } from './danbooru'
import { gelbooru } from './gelbooru'
import { realbooru } from './realbooru'
import { rule34 } from './rule34'
import { tentaclerape } from './tentaclerape'
import { yandere } from './yandere'

const SERVERS: { [k: string]: ServerModel } = {
    rule34,
    danbooru,
    tentaclerape,
    yandere,
    realbooru,
    gelbooru,
} as const

export { SERVERS, gelbooru, realbooru, rule34, yandere, tentaclerape, danbooru }
