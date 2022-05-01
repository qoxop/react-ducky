import React from "react";
import { useRoutes } from 'react-router-dom';
import { HomePage } from "@pages/home/page.home";
import { TodoListPage } from "@pages/todo/page.todos";
import { ArticleListPage } from "src/pages/articles/page.article-list";
import { ArticleDetailPage } from "src/pages/articles/page.article-detail";

export const App = () => {
  const element = useRoutes([
    {
      path: '/',
      element: <HomePage />
    },
    {
      path: '/todo/list',
      element: <TodoListPage />
    }, {
      path: '/article/list',
      element: <ArticleListPage />
    }, {
      path: '/article/detail',
      element: <ArticleDetailPage />
    }
  ])
  return <div className="max-w-screen-md mx-auto h-full">{element}</div>;
}

