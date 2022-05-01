import { Article, ArticleType  } from "@pages/articles/model.type";
import { delay, fetchImgs } from "@utils/services";
import { store } from "src/provider";

const mockArticle = async (type?: any) => {
  const data = await fetchImgs(1);
  return {
    id: Mock.Random.guid(),
    cover: data[0],
    title:  Mock.Random.title(),
    author: Mock.Random.name(),
    createTime: Mock.Random.date(),
    description: Mock.Random.paragraph(),
    content: Mock.Random.range(0, 8).map(() => Mock.Random.paragraph()).join('\n'),
    type
  }
};

export const fetchArticles = async (
  {
    page,
    size,
    type,
  }: { page: number, size: number, type: ArticleType  },
): Promise<{ list: Article[]; total: number }> => {
  const total = 999;
  await delay(2000);
  const realSize = size * page > total ? Math.max(0, total - size * page) : size;
  const list = await Promise.all(Mock.Random.range(0, realSize).map(() => mockArticle(type)));
  return {
    list,
    total,
  }
}

export const fetchArticle = async (id: string): Promise<Article> => {
  await delay(500);
  const article = store.getState().articles.list.find(article => article.id === id);
  if (article) {
    return article;
  }
  return await mockArticle();
}