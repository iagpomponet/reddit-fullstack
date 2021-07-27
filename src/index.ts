import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { __prod__ } from "./constants";
import { PostResolver } from "./resolvers/post";
// import { Post } from "./entities/Post";

import mikroOrmConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);

  //run the migrations
  orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
    // this context function is used to pass things to be acessed in out resolvers
  });

  await apolloServer.start();

  // create a graphql endpoint for us in exprsss
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server startet at localhost:4000");
  });

  // rest endpoint example

  // const post = orm.em.create(Post, { title: "my first post" });
  // await orm.em.persistAndFlush(post);

  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
};

main();
