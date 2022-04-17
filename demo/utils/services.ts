import coolImages from 'cool-images';
import { TodoItem } from '../pages/todo/model.type';

export const fetchImgs = (size: number = 10) => {
  return Promise.resolve(coolImages.many(300, 500, size));
}

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
