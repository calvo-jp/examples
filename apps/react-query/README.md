# React Query 101

## Difference between `@apollo/client`

- denormalized cache

  **Normalized**

  ```ts
  const refs = {
    '{"__typename":"Aa","id":"1"}': { prop1: '', prop2: '' },
    '{"__typename":"Aa","id":"2"}': { prop1: '', prop2: '' },
    '{"__typename":"Bb","id":"3"}': { prop1: '', prop2: '' },
    '{"__typename":"Bb","id":"4"}': { prop1: '', prop2: '' },
    '{"__typename":"Cc","id":"5"}': { prop1: '', prop2: '' },
    '{"__typename":"Cc","id":"6"}': { prop1: '', prop2: '' },
  };

  const cache = {
    '{"key":"Query1","first":5,"after":null}': [refs[0], refs[1], ...],
    '{"key":"Query1","first":5,"after":"cursorA"}': [],
    '{"key":"Query1","first":5,"after":"cursorB"}': [],

    '{"key":"Query2","first":5,"after":null}': [refs[2], refs[3]],

    '{"key":"Query3","first":5,"after":null}': [refs[4], refs[5]],

    '{"key":"QueryNode1","id":"1"}': refs[0],
    '{"key":"QueryNode2","id":"2"}': refs[1],
    '{"key":"QueryNode3","id":"3"}': refs[2],
  };
  ```

  Query fired somewhere in the app

  ```json
  "node": {
    "prop1": "",
    "prop3": "",
    "id": "1",
    "__typename": "Aa"
  }
  ```

  Mutation (delete) fired

  ```ts
  cache.identify(/* ... */);
  cache.evict(/* ... */);
  ```

  <br/>

  **Denormalized**

  ```ts
  const cache = {
    '["key1",{"subkey":1}]': [],
    '["key1",{"subkey":2}]': [],
    '["key1",{"subkey":3}]': [],
    '["key2"]': {},
    '["key3"]': {},
  };
  ```

  <br/>

- Agnostic to fetching methods
- First class SSR support (cache rehydration)
- Light-weight

## Usage

- **global config**
- **hooks/utils**
  - `useQuery`
  - `useMutation` (cache updates & optimistic response)
  - `useInfiniteQuery`
  - `prefetchQuery`
- **query deduplication**
- **enabling/disabling queries**
- **polling**
- **Importance of query keys**

  ```ts
  ["games", "list", { q: "Aa" }]
  ["games", "detail", <id>]
  ```
