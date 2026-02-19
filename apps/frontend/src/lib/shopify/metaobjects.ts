
import { shopifyFetch } from "./client";
import { Metaobject, MetaobjectField } from "./types";

export type { Metaobject, MetaobjectField };

const GET_METAOBJECTS_QUERY = `
  query GetMetaobjects($type: String!, $first: Int = 20) {
    metaobjects(type: $type, first: $first) {
      edges {
        node {
          id
          handle
          type
          fields {
            key
            value
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_METAOBJECT_BY_HANDLE_QUERY = `
  query GetMetaobjectByHandle($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      id
      handle
      type
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

export async function getMetaobjects(type: string, first = 20): Promise<Metaobject[]> {
  const res = await shopifyFetch<{
    metaobjects: { edges: { node: any }[] };
  }>({
    query: GET_METAOBJECTS_QUERY,
    variables: { type, first },
    tags: [`metaobjects-${type}`],
  });

  return res.data?.metaobjects?.edges?.map((edge) => edge.node) || [];
}

export async function getMetaobjectByHandle(type: string, handle: string): Promise<Metaobject | null> {
  const res = await shopifyFetch<{
    metaobject: any;
  }>({
    query: GET_METAOBJECT_BY_HANDLE_QUERY,
    variables: { handle: { type, handle } },
    tags: [`metaobjects-${type}-${handle}`],
  });

  return res.data?.metaobject || null;
}
