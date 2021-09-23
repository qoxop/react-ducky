import { TodoItem } from '../typings';

export function fetchTodoList() {
    return new Promise<TodoItem[]>((resolve) => {
        setTimeout(() => {
            const data = JSON.parse(localStorage.getItem('my-todos') || '{}');
            console.log(data,Object.values(data.todos));
            if (data.todos) {
                resolve(Object.values(data.todos));
            } else {
                resolve([]);
            }
        }, 1000);
    });
}