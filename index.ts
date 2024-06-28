/**
 * Husk, a session-based logger.
 */
export default class Husk<Schema extends Record<string, unknown>> {
  protected recorders: RecorderGroup<Schema>
  
  /**
   * Initializes an instance of Husk.
   */
  public constructor(options: HuskOptions<Schema>) {
    this.recorders = options.recorders
  }

  /**
   * Builds a recorder.
   */
  public static recorder<Type, Tag>(send: Recorder<Type, Tag>['send']) {
    return { send }
  }
  
  /**
   * Starts a new recording session.
   */
  public session<Tag extends keyof Schema>(options: { tag: TagGroup<Tag> }) {
    return {
      trace: (message: Schema[Tag], meta?: unknown) => this.record(options.tag as string[], message, meta)
    }
  }

  /**
   * This function is used to record messages from sessions.
   */
  protected record(tags: string[], message: unknown, meta: unknown) {
    const recorder = (this.recorders[tags[0]] || this.recorders['_']) as Recorder<unknown, unknown>

    recorder.send({ tags: tags as [unknown, ...string[]], message, meta })
  }
}

// This represents a group of tags, starting with the key tag at tags[0].
export type TagGroup<T> = [T, ...string[]]

// A recorder object with a `send` function.
export type Recorder<MessageType, Tag> = {
  send: (context: { tags: TagGroup<Tag>, message: MessageType, meta?: unknown }) => unknown
}

// A typed group of recorders
type RecorderGroup<Schema> = { [Tag in keyof Schema]?: Recorder<Schema[Tag], Tag> } & {
  _: Recorder<unknown, string>
}

/**
 * This is the options for initializing a Husk instance.
 * - Setup `recorders` for a persistent register of records.
 * - Setup `middlewares` for transforming data.
 */
export type HuskOptions<T extends Record<string, unknown>> = {
  recorders: RecorderGroup<T>
}
