import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";

import path from "path";
// path is a function built in to node

export default {
  entities: [Post],
  dbName: "lireddit",
  type: "postgresql",
  debug: !__prod__,
  password: "crudehumor",
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[ts]s$/,
  },
} as Parameters<typeof MikroORM.init>[0];

// this type thing make us get the type that mikro orm actually expects in its first parameter
