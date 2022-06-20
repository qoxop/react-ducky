import React, { useCallback } from "react";
import { useSelector, withPageHook } from "react-ducky";
import { Loading, RadioGroup } from "@components";
import { useMemoriesScroll, useMemoriesVisited } from "@utils/hooks";

import { ArticleSection } from "./components/article-section";
import { articleActions, getArticleState, useArticles } from "./model";

const ArticleTypeOptions = [
  { label: 'SelfCreate', value: 'self-created' },
  { label: 'Repost', value: 'repost' },
]

const Articles:React.FC = () => {
  const { total, list, fetchStatus, type } = useArticles();
  const handleTypeChange = useCallback((value: any) => {
    articleActions.setType(value);
    articleActions.loadArticles({ page: 1, size: 10, type: value });
  }, []);
  const routes = useSelector(state => state._CURRENT_ROUTE);
  console.log(routes);
  const [ visited, onVisit ] = useMemoriesVisited([type]);
  const [ handleScroll, scrollBoxRef ] = useMemoriesScroll({
    resetBy: [type],
    onScrollEnd: () => {
      const { page, pageSize, type, total } = getArticleState();
      if (page * pageSize > total) {
        return Promise.resolve();
      }
      return articleActions.loadArticles({ page: 1 + page, size: pageSize, type });
    }
  })
  return (
    <div className="h-full p-4 flex flex-col relative">
      <h3 className='text-lg mb-4'>Article List({total})</h3>
      <div className="absolute top-6 right-4">
        <RadioGroup
            options={ArticleTypeOptions}
            value={type}
            onChange={handleTypeChange}
        />
      </div>
      <hr className="border-b-2 border-gray-200"/>
      { fetchStatus === 'reloading' ? <Loading /> : (
        <div onScroll={handleScroll} ref={scrollBoxRef} className="flex-1 overflow-scroll mt-2">
          {list.map(article => (<ArticleSection
              key={article.id}
              article={article}
              onVisit={onVisit}
              visited={visited[article.id]}
            />))}
          {fetchStatus === 'loading' && (
            <div className='h-8'>
              <Loading />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const ArticleListPage = withPageHook(Articles, {
  onEnter(action) {
    if (action === 'push') {
      articleActions.loadArticles({ page: 1, size: 10, type: 'self-created' });
    }
  }
});