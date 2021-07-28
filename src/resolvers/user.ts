import {
  Resolver,
  Field,
  InputType,
  Mutation,
  Arg,
  Ctx,
  Query,
  ObjectType,
} from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [InputError], { nullable: true })
  errors?: InputError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class InputError {
  @Field(() => String, { nullable: true })
  field: string;
  @Field(() => String, { nullable: true })
  message: string;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
    //check if im logged
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (!options?.username) {
      return {
        errors: [
          {
            field: "username",
            message: "user must have a username",
          },
        ],
      };
    }

    const user = await em.findOne(User, { username: options.username });

    if (user) {
      return {
        errors: [
          {
            field: "username already exists",
            message: "User already exists",
          },
        ],
      };
    }

    if (options?.password?.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "password must be at least 3 chars long",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options?.password);
    const newUser = em.create(User, {
      username: options?.username,
      password: hashedPassword,
    });

    try {
      await em.persistAndFlush(newUser);
    } catch (error) {
      console.log("message", error.message);
      return {
        errors: [
          {
            field: "username",
            message: error.message,
          },
        ],
      };
    }

    //store user id session - will set cookie for user and keep you logged in
    req.session.userId = newUser.id;

    return {
      user: newUser,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // if (!options?.username) {
    //   return {
    //     errors: [
    //       {
    //         field: "username",
    //         message: "username must not be empty",
    //       },
    //     ],
    //   };
    // }

    const user = await em.findOne(User, { username: options.username });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "That username does not exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    //store user id session - will set cookie for user and keep you logged in
    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Query(() => User, { nullable: true })
  async getUser(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    const user = await em.findOne(User, { id });

    return user;
  }
}
