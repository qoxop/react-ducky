import React from "react";
import { Link } from "react-router-dom";

import { Article } from "../model.type";

export const ArticleSection:React.FC<{
  article: Article;
  onVisit?: (id: string) => void;
  visited?: boolean;
}> = React.memo(({ article, visited, onVisit }) => {
  return (
    <section className="mb-7">
      <h3 className="text-2xl text-bold">
        <Link onClick={() => onVisit(article.id)} className={visited ? 'text-fuchsia-700': ''} to={{pathname: '/article/detail', search: `article_id=${article.id}`}}>
          {article.title}
        </Link>
      </h3>
      <div className="flex my-2 text-bold text-slate-500">
        <div className="mr-4">Author: {article.author}</div>
        <div className="mr-4">Date: {article.createTime}</div>
      </div>
      <p className="text-hide-4">{article.description}</p>
    </section>
  )
})