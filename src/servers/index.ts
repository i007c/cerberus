import { danbooru } from './danbooru'
import { gelbooru } from './gelbooru'
import { realbooru } from './realbooru'
import { rule34 } from './rule34'
import { tentaclerape } from './tentaclerape'
import { yandere } from './yandere'

const SERVERS = {
    danbooru,
    tentaclerape,
    yandere,
    rule34,
    realbooru,
    gelbooru,
}

export { SERVERS, gelbooru, realbooru, rule34, yandere, tentaclerape, danbooru }
