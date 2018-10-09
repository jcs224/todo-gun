import collect from 'collect.js'

let State = {
    todosGun: null,
    todos: [],
    text: '',
    editText: '',
    highestOrder: 0,
    page: 'uncompleted',
    editId: null,

    displayEdit(value) {
        State.editId = value
        State.editText = collect(State.todos).where('id', value).first().text
    },

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
        State.editId = null
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

export default State