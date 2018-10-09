import '@fortawesome/fontawesome-free/js/all.js'
import './app.scss'
import m from 'mithril'
import Gun from 'gun/gun'
import _ from 'lodash'
import collect from 'collect.js'

import TodoItem from './components/TodoItem'
import State from './State'

let App = {
    oncreate() {
        State.todosGun = Gun(process.env.GUN_URL ? process.env.GUN_URL : '').get('todos')

        State.todosGun.map().on((todoGun, id) => {
            // if null at this id, it has been deleted. Remove it from display as well.
            if (todoGun === null) { 
                let deleteIndex = _.findIndex(State.todos, (todo) => {
                    return todo.id == id
                })

                State.todos.splice(deleteIndex, 1)
            } else {
                // Either adding or editing a todo item
                // Even when editing, it is necessary to remove redundant entry from display list.
                let order = null // Maintain order in list
                if (collect(State.todos).contains('id', id)) {
                    let deleteIndex = _.findIndex(State.todos, (todo) => {
                        return todo.id == id
                    })

                    order = State.todos[deleteIndex].order // Use existing order when editing
                    State.todos.splice(deleteIndex, 1)
                } else {
                    State.highestOrder += 1 // Increment by one if adding new
                    order = State.highestOrder
                }

                State.todos.push({id: id, text: todoGun.text, completed: todoGun.completed, order: order})
            }
            // Since it wasn't a Mithril-invoked event, must redraw manually
            m.redraw()
        })
    },

    view() {
        return m('.container', [
            m('.columns', [
                m('.column.is-half.is-offset-one-quarter', {
                    style: 'padding: 2rem;'
                }, [
                    m('.panel', [
                        m('h1.panel-heading', [
                            'Todos'
                        ]),
                        m('.panel-block', [
                            m('form', {
                                onsubmit: (e) => {
                                    e.preventDefault()
                                    State.addTodo()
                                },
                                style: 'width: 100%'
                            }, [
                                m('.field.has-addons', [
                                    m('.control', {
                                        style: 'width: 100%'
                                    }, [
                                        m('input.input', {
                                            placeholder: 'Add todo...',
                                            oninput: m.withAttr('value', State.setTodo),
                                            value: State.text
                                        })
                                    ]),
                                    m('.control', [
                                        m('button.button.is-primary', {
                                            type: 'submit'
                                        }, m('i.fas.fa-plus'))
                                    ])
                                ])
                            ])
                        ]),
                        m('p.panel-tabs', [
                            m('a', { 
                                class: State.page == 'uncompleted' ? 'is-active' : null,
                                onclick: () => {
                                    State.page = 'uncompleted'
                                } 
                            }, 'Uncompleted'),
                            m('a', { 
                                class: State.page == 'completed' ? 'is-active' : null,
                                onclick: () => {
                                    State.page = 'completed'
                                }  
                            }, 'Completed')
                        ]),
                        // Show incomplete todos
                        State.page == 'uncompleted' ?
                        collect(State.todos).filter((todo) => {
                            return todo.completed === false
                        }).sortBy('order').map((todo) => {
                            return m(TodoItem, {
                                todo: todo,
                                completed: false
                            })
                        }).all() : null,
                        // Show completed todos
                        State.page == 'completed' ?
                        collect(State.todos).filter((todo) => {
                            return todo.completed === true
                        }).sortBy('order').map((todo) => {
                            return m(TodoItem, {
                                todo: todo,
                                completed: true
                            })
                        }).all() : null,
                    ])
                ])
            ])  
        ])
    }
}

m.mount(document.body, App)