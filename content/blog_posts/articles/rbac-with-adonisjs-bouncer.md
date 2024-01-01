---
summary: Since Bouncer provides low-level generic API's, you can use them to create a custom authorization like RBAC.
---

Today we're excited to announce the release of Vue 3.3 "Rurouni Kenshin"!

This release is focused on developer experience improvements - in particular, SFC `<script setup>` usage with TypeScript. Together with the 1.6 release of [Vue Language Tools]() (previously known as Volar), we have resolved many long-standing pain points when using Vue with TypeScript.

This post provides an overview of the highlighted features in 3.3. For the full list of changes, please consult the full changelog on GitHub.

## Imported and Complex Types Support in Macros

Previously, types used in the type parameter position of `defineProps` and `defineEmits` were limited to local types, and only supported type literals and interfaces. This is because Vue needs to be able to analyze the properties on the props interface in order to generate corresponding runtime options.

This limitation is now resolved in 3.3. The compiler can now resolve imported types, and supports a limited set of complex types:

```tsx
<script setup lang="ts">
  import type { Props } from './foo'

  // imported + intersection type
  defineProps<Props & { extraProp?: string }>()
</script>
```
