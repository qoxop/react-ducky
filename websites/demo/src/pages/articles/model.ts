import {
  createModel,
  PayloadAction,
  createPaginationHandler,
} from 'react-ducky';
import { Article, ArticleType } from './model.type';
import { fetchArticle, fetchArticles } from '@services/index';
import { updateReducer } from 'src/provider';

type FetchStatus = 'idle' | 'reloading' | 'loading' | 'error';

const articleModel = createModel({
  statePaths: ['articles'],
  initialState: {
    type: 'self-created' as ArticleType,
    list: [] as Article[],
    page: 0,
    total: 0,
    pageSize: 10,
    fetchStatus: 'idle' as FetchStatus,
    currentArticle: null as Article,
  },
  reducers: {
    setStatus: (state, action: PayloadAction<FetchStatus>) => {
      state.fetchStatus = action.payload;
    },
    setType: (state, action: PayloadAction<ArticleType>) => {
      state.type = action.payload;
    },
    updateList: (state, action:PayloadAction<{
      list: Article[],
      total: number,
      page: number,
      size: number,
      append: boolean
    }>) => {
      state.fetchStatus = 'idle';
      if (action.payload.append) {
        state.list = state.list.concat(action.payload.list);
      } else {
        state.list = action.payload.list;
      }
      state.page = action.payload.page;
      state.total = action.payload.total;
    },
  },
  fetch: {
    currentArticle: fetchArticle,
  },
  cacheKey: 'my-article-model',
  cacheStorage: 'session',
});

const loadArticles = createPaginationHandler({
  fetcher: fetchArticles,
  isReset: ({ page }) => page === 1,
  before: ({ page }) => {
    articleModel.actions.setStatus(page === 1 ? 'reloading' : 'loading');
  },
  after: ([data, [params], error]) => {
    if (error) {
      articleModel.actions.setStatus('error');
    } else {
      articleModel.actions.updateList({
        ...data,
        ...params,
        append: params.page > 1
      });
    }
  }
});
export const getArticleState = articleModel.getState;
export const useArticles = articleModel.useModel;
export const articleActions = {
  ...articleModel.actions,
  fetchArticle: articleModel.fetch.currentArticle,
  loadArticles,
};

// connect to redux
updateReducer({ articles: articleModel.reducer });