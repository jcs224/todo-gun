import './app.scss'
import m from 'mithril'

let App = {
    view() {
        return m('.container', [
            m('h1.title.is-1', 'Hey there, Gun!')  
        ])
    }
}

m.mount(document.body, App)