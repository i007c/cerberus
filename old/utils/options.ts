import { server_opt } from 'elements'
import { SERVERS, State } from 'globals'
import { load_favorite_list } from './favorite'

function update_server(movement: number) {
    let options = server_opt.querySelectorAll('option')
    let idx = server_opt.selectedIndex + movement

    if (idx >= options.length) idx = 0
    if (idx < 0) idx = options.length - 1

    server_opt.value = options[idx]!.value

    // @ts-ignore
    State.server = SERVERS[server_opt.value]
    load_favorite_list(State.server.name)
}

export { update_server }
