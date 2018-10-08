import '@fortawesome/fontawesome-free/js/all.js'
import './app.scss'
import m from 'mithril'
import Gun from 'gun/gun'
import _ from 'lodash'
import collect from 'collect.js'

let State = {
    todosGun: null,
    todos: [],
    text: '',
    editText: '',
    highestOrder: 0,

    setTodo(value) {
        State.text = value
    },

    addTodo() {
        State.todosGun.set({text: State.text, completed: false})
        State.text = ''
    },

    setEditText(value) {
        State.editText = value
    },

    editTodo(id) {
        State.todosGun.get(id).put({text: State.editText})
        App.editId = null
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
    editId: null,

    displayEdit(value) {
        App.editId = value
        State.editText = collect(State.todos).where('id', value).first().text
    },

    oninit() {
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
                        collect(State.todos).filter((todo) => {
                            return todo.completed === false
                        }).sortBy('order').map((todo) => {
                            return m('.panel-block', {
                                style: 'justify-content: space-between'
                            }, [
                                todo.id === App.editId ? 
                                m('form', {
                                    onsubmit: (e) => {
                                        e.preventDefault()
                                        State.editTodo(todo.id)
                                    }
                                }, [
                                    m('.field.has-addons', {
                                        style: 'width: 100%'
                                    }, [
                                        m('.control', {
                                            style: 'width: 100%'
                                        }, [
                                            m('input.input.is-small', {
                                                id: 'todo-edit-'+todo.id,
                                                placeholder: 'Edited todo...',
                                                oninput: m.withAttr('value', State.setEditText),
                                                value: State.editText,
                                                oncreate(vnode) {
                                                    vnode.dom.focus()
                                                }
                                            })
                                        ]),
                                        m('.control', [
                                            m('button.button.is-link.is-small', {
                                                type: 'submit'
                                            }, 'Submit')
                                        ]),
                                        m('.control', [
                                            m('a.button.is-warning.is-small', {
                                                onclick: () => {
                                                    App.editId = null
                                                }
                                            }, 'Cancel')
                                        ])
                                    ])
                                ])
                                : [
                                    m('label', [
                                        m('input', {
                                            key: todo.id,
                                            type: 'checkbox',
                                            onchange: m.withAttr('checked', () => {
                                                State.completeTodo(todo.id)
                                            })
                                        }),
                                        todo.text,
                                    ]),
                                    m('.field.has-addons', [
                                        m('p.control', [
                                            m('button.button.is-info.is-small', {
                                                onclick: () => {
                                                    App.displayEdit(todo.id)
                                                }
                                            }, m('i.fas.fa-edit'))
                                        ]),
                                        m('p.control', [
                                            m('button.button.is-danger.is-small', {
                                                onclick: () => {
                                                    State.deleteTodo(todo.id)
                                                }
                                            }, m('i.fas.fa-trash-alt'))
                                        ])
                                    ])
                                ]
                            ])
                        }).all() : null,
                        // Show completed todos
                        App.page == 'completed' ?
                        collect(State.todos).filter((todo) => {
                            return todo.completed === true
                        }).sortBy('order').map((todo) => {
                            return m('.panel-block', {
                                style: 'justify-content: space-between'
                            }, [
                                todo.id === App.editId ? 
                                m('form', {
                                    onsubmit: (e) => {
                                        e.preventDefault()
                                        State.editTodo(todo.id)
                                    }
                                }, [
                                    m('.field.has-addons', {
                                        style: 'width: 100%'
                                    }, [
                                        m('.control', {
                                            style: 'width: 100%'
                                        }, [
                                            m('input.input.is-small', {
                                                id: 'todo-edit-'+todo.id,
                                                placeholder: 'Edited todo...',
                                                oninput: m.withAttr('value', State.setEditText),
                                                value: State.editText,
                                                oncreate(vnode) {
                                                    vnode.dom.focus()
                                                }
                                            })
                                        ]),
                                        m('.control', [
                                            m('button.button.is-link.is-small', {
                                                type: 'submit'
                                            }, 'Submit')
                                        ]),
                                        m('.control', [
                                            m('a.button.is-warning.is-small', {
                                                onclick: () => {
                                                    App.editId = null
                                                }
                                            }, 'Cancel')
                                        ])
                                    ])
                                ])
                                : [
                                    m('label', [
                                        m('input', {
                                            key: todo.id,
                                            type: 'checkbox',
                                            onchange: m.withAttr('checked', () => {
                                                State.uncompleteTodo(todo.id)
                                            }),
                                            checked: true
                                        }),
                                        m('del', todo.text)
                                    ]),
                                    m('.field.has-addons', [
                                        m('p.control', [
                                            m('button.button.is-info.is-small', {
                                                onclick: () => {
                                                    App.displayEdit(todo.id)
                                                }
                                            }, m('i.fas.fa-edit'))
                                        ]),
                                        m('p.control', [
                                            m('button.button.is-danger.is-small', {
                                                onclick: () => {
                                                    State.deleteTodo(todo.id)
                                                }
                                            }, m('i.fas.fa-trash-alt'))
                                        ])
                                    ])
                                ]
                            ])
                        }).all() : null,
                    ])
                ])
            ])  
        ])
    }
}

m.mount(document.body, App)