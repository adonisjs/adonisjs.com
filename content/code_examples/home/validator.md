```sh
node ace make:validator posts
```

```ts
import vine from '@vinejs/vine'

export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().min(4).max(256),
    contents: vine.string().trim()
  })
)
```
