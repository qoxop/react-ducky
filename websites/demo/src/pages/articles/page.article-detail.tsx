import qs from "qs";
import { Loading } from "@components";
import { usePageEffect } from "react-ducky";
import { useLocation } from "react-router-dom";
import React, { Suspense, useMemo } from "react";
import { useMemoriesScroll } from "@utils/hooks";
import { useArticles, articleActions } from "./model";

const ArticleDetail: React.FC = () => {

  const article = useArticles(state => state.currentArticle, { withSuspense: true });

  const [handleScroll, scrollBoxRef] = useMemoriesScroll();

  return (
    <article className="p-4 flex flex-col h-full">
      <h1 className="text-2xl text-bold">
        {article.title}
      </h1>
      <div className="flex py-2 text-bold text-slate-500">
        <div className="mr-4">Author: {article.author}</div>
        <div className="mr-4">Date: {article.createTime}</div>
      </div>
      <hr className="border-b-2 border-gray-200"/>
      <div ref={scrollBoxRef} onScroll={handleScroll} className="flex-1 overflow-scroll">
        <div className="py-4 px-6">
          <img src={article.cover} style={{width: '100%', minHeight: 382}} alt="" />
        </div>
        {article.content.split("\n").map((item, index) => (
          <p
            key={index}
            className="indent-2 my-2"
          >
            {item}
          </p>
        ))}
      </div>
    </article>
  )
}

export const ArticleDetailPage:React.FC = () => {
  const { search } = useLocation();
  const { article_id } = useMemo(() => qs.parse(search, { ignoreQueryPrefix: true }), [search]);
  usePageEffect({
    onEnter: (action) => {
      if (action === "push") {
        articleActions.fetchArticle(article_id as string);
      }
    },
  });
  return (
    <Suspense fallback={<Loading />}>
      <ArticleDetail />
    </Suspense>
  )
}
