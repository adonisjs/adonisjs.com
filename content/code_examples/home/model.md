```sh
node ace make:model post
```

```ts
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Post extends BaseModel {
  @column()
  declare id: number

  @column()
  declare title: string

  @column()
  declare contents: string
}
```
