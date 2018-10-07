import './app.scss'
import m from 'mithril'
import Gun from 'gun/gun'
import _ from 'lodash'
import collect from 'collect.js'

let State = {
    todosGun: null,
    todos: [],
    text: '',

    setTodo(value) {
        State.text = value
    },

    addTodo() {
        State.todosGun.set({text: State.text, completed: false})
        State.text = ''
    },

    deleteTodo(id) {
        State.todosGun.get(id).put(null)
    },

    completeTodo(id) {
        State.todosGun.get(id).put({completed: true})
    },

    uncompleteTodo(id) {
        State.todosGun.get(id).put({completed: false})
    }
}

let App = {
    page: 'uncompleted',

    oninit() {
        State.todosGun = Gun().get('todos')

        State.todosGun.map().on((todoGun, id) => {
            // if null at this id, it has been deleted. Remove it from display as well.
            if (todoGun === null) { 
                let deleteIndex = _.findIndex(State.todos, (todo) => {
                    return todo.id == id
                })

                State.todos.splice(deleteIndex, 1)
            } else {
                // Either adding or editing a todo item
                // Even when editing, it is necessary to remove redundant entry from display list
                if (collect(State.todos).contains('id', id)) {
                    let deleteIndex = _.findIndex(State.todos, (todo) => {
                        return todo.id == id
                    })

                    State.todos.splice(deleteIndex, 1)
                }

                State.todos.push({id: id, text: todoGun.text, completed: todoGun.completed})
            }
            // Since it wasn't a Mithril-invoked event, must redraw manually
            m.redraw()
            console.log(State.todos)
        })
    },

    view() {
        return m('.container', [
            m('h1.title.is-one', 'Todo Gun demo'),
            m('.columns', [
                m('.column.is-one-third', [
                    m('.panel', [
                        m('p.panel-heading', [
                            'Todos'
                        ]),
                        m('.panel-block', [
                            m('.field.has-addons', [
                                m('.control', [
                                    m('input.input', {
                                        placeholder: 'Add todo...',
                                        oninput: m.withAttr('value', State.setTodo),
                                        value: State.text
                                    })
                                ]),
                                m('.control', [
                                    m('a.button.is-info', {
                                        onclick: () => {
                                            State.addTodo()
                                        }
                                    }, 'Add')
                                ])
                            ])
                        ]),
                        m('p.panel-tabs', [
                            m('a', { 
                                class: App.page == 'uncompleted' ? 'is-active' : null,
                                onclick: () => {
                                    App.page = 'uncompleted'
                                } 
                            }, 'Uncompleted'),
                            m('a', { 
                                class: App.page == 'completed' ? 'is-active' : null,
                                onclick: () => {
                                    App.page = 'completed'
                                }  
                            }, 'Completed')
                        ]),
                        // Show incomplete todos
                        App.page == 'uncompleted' ?
                        State.todos.filter((todo) => {
                            return todo.completed === false
                        }).map((todo) => {
                            return m('.panel-block', [
                                m('.level', {style: 'width: 100%'}, [
                                    m('.level-left', [
                                        m('.level-item', [
                                            m('label', [
                                                m('input', {
                                                    type: 'checkbox',
                                                    onchange: m.withAttr('checked', () => {
                                                        State.completeTodo(todo.id)
                                                    })
                                                }),
                                                todo.text,
                                            ]),
                                        ])
                                    ]),
                                    m('.level-right', [
                                        m('.level-item', [
                                            m('button.button.is-danger.is-small', {
                                                onclick: () => {
                                                    State.deleteTodo(todo.id)
                                                }
                                            }, 'Delete')
                                        ])
                                    ])
                                ]),
                            ])
                        }) : null,
                        // Show completed todos
                        App.page == 'completed' ?
                        State.todos.filter((todo) => {
                            return todo.completed === true
                        }).map((todo) => {
                            return m('.panel-block', [
                                m('.level', {style: 'width: 100%'}, [
                                    m('.level-left', [
                                        m('.level-item', [
                                            m('label', [
                                                m('input', {
                                                    type: 'checkbox',
                                                    onchange: m.withAttr('checked', () => {
                                                        State.uncompleteTodo(todo.id)
                                                    })
                                                }),
                                                todo.text,
                                            ]),
                                        ])
                                    ]),
                                    m('.level-right', [
                                        m('.level-item', [
                                            m('button.button.is-danger.is-small', {
                                                onclick: () => {
                                                    State.deleteTodo(todo.id)
                                                }
                                            }, 'Delete')
                                        ])
                                    ])
                                ])
                            ])
                        }) : null,
                    ])
                ])
            ])  
        ])
    }
}

m.mount(document.body, App)