import express from "express";
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";

import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import redis from "redis";
import session from "express-session";

import connectRedis from "connect-redis";
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);

  //run the migrations
  orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  //middleware -- the order that is here matters, bcause its the order its going to run
  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 69 * 24 * 365 * 10,
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax", //csrf
      },
      secret: "hjhjkhjkhkjhkjhj",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
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
