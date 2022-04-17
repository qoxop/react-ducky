import { TodoItem } from "./model.type";

export const fetchMyTodo = (): Promise<TodoItem[]> => {
  const data = Mock.Random.range(10).map(() => ({
    id: Mock.Random.guid(),
    title: Mock.Random.ctitle(),
    description: Mock.Random.csentence(),
    expired: Mock.Random.date('YYYY-MM-dd'),
    finished: Mock.Random.boolean(),
  }))
  return Promise.resolve(data);
}

export const updateMyTodo = (todo: TodoItem): Promise<TodoItem> => {
  return Promise.resolve({
    ...todo,
    id: todo.id || Mock.Random.guid(),
  })
}