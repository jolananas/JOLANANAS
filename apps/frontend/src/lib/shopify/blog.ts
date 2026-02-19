
import { shopifyFetch } from "./client";
import { Image, Article, Blog } from "./types";

export type { Article, Blog };

const GET_ARTICLES_QUERY = `
  query GetArticles($first: Int = 3) {
    articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
      edges {
        node {
          id
          handle
          title
          excerpt
          excerptHtml
          publishedAt
          image {
            url
            altText
          }
          author {
            name
          }
          blog {
            handle
            title
          }
        }
      }
    }
  }
`;

const GET_ARTICLE_BY_HANDLE_QUERY = `
  query GetArticleByHandle($handle: String!, $blogHandle: String!) {
    blogByHandle(handle: $blogHandle) {
      articleByHandle(handle: $handle) {
        id
        handle
        title
        contentHtml
        excerpt
        excerptHtml
        publishedAt
        image {
          url
          altText
        }
        author {
          name
        }
        blog {
          handle
          title
        }
      }
    }
  }
`;

export async function getArticles(first = 3): Promise<Article[]> {
  const res = await shopifyFetch<{
    articles: { edges: { node: any }[] };
  }>({
    query: GET_ARTICLES_QUERY,
    variables: { first },
    tags: ["articles"],
  });

  return res.data?.articles?.edges?.map((edge) => edge.node) || [];
}

export async function getArticleByHandle(blogHandle: string, handle: string): Promise<Article | null> {
  const res = await shopifyFetch<{
    blogByHandle: { articleByHandle: any };
  }>({
    query: GET_ARTICLE_BY_HANDLE_QUERY,
    variables: { blogHandle, handle },
    tags: [`article-${blogHandle}-${handle}`],
  });

  return res.data?.blogByHandle?.articleByHandle || null;
}
