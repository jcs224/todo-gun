import m from 'mithril'
import State from '../State'

let TodoItem = {
    view(vnode) {
        let todo = vnode.attrs.todo

        return m('.panel-block', {
            style: 'justify-content: space-between'
        }, [
            todo.id === State.editId ? 
            m('form', {
                onsubmit: (e) => {
                    e.preventDefault()
                    State.editTodo(todo.id)
                },
                style: 'width: 100%'
            }, [
                m('.field.has-addons', [
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
                                State.editId = null
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
                            vnode.attrs.completed ? State.uncompleteTodo(todo.id) : State.completeTodo(todo.id)
                        }),
                        checked: vnode.attrs.completed
                    }),
                    vnode.attrs.completed ? m('del', todo.text) : todo.text,
                ]),
                m('.field.has-addons', [
                    m('p.control', [
                        m('button.button.is-info.is-small', {
                            onclick: () => {
                                State.displayEdit(todo.id)
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
    }
}

export default TodoItem