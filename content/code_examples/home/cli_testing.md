```ts
import { test } from '@japa/runner'
import ace from '@adonisjs/core/services/ace'
import Greet from '#commands/greet'

test('greet the user and exit successfully', async () => {
  /**
   * Create an instance of the CLI command
   * and execute it
   */
  const command = await ace.create(Greet, ['virk'])
  await command.exec()

  /**
   * Write assertions for the command status and
   * logs
   */ 
  command.assertSucceeded()
  command.assertLog('[ blue(info) ] Hello world from "Greet"')
})
```
