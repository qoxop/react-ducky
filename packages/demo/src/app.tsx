import React from "react";
import { useRoutes } from 'react-router-dom';
import { HomePage } from "./pages/home/home";
import { TodoEdit } from "./pages/todo/page.edit";
import { TodoListPage } from "./pages/todo/page.list";

export const App = () => {
  const element = useRoutes([
    {
      path: '/',
      element: <HomePage />
    },
    {
      path: '/todo/list',
      element: <TodoListPage />
    },
    {
      path: '/todo/edit',
      element: <TodoEdit />
    },
  ])
  return <div className="container mx-auto">{element}</div>;
}

