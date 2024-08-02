import algoliasearch from "algoliasearch";

export function agoliaSearchClient() {
  return algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_ID!,
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
  );
}
