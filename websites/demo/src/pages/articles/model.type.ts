type ArticleType = 'self-created' | 'repost';

type Article = {
  id: string;
  title: string;
  cover: string;
  author: string;
  createTime: string;
  description: string;
  content: string;
  type: ArticleType;
}

export type {
  Article,
  ArticleType,
}