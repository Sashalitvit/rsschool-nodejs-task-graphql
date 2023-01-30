import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  graphql,
  GraphQLID,
} from 'graphql';
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { User, Post, MemberType, Profile } from './types';


const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'BasicQuery',
          fields: {
            users: {
              type: new GraphQLList(User),
              async resolve() {
                return await fastify.db.users.findMany();
              }
            },
            posts: {
              type: new GraphQLList(Post),
              async resolve() {
                return await fastify.db.posts.findMany();
              }
            },
            memberTypes: {
              type: new GraphQLList(MemberType),
              async resolve() {
                return await fastify.db.memberTypes.findMany();
              }
            },
            profiles: {
              type: new GraphQLList(Profile),
              async resolve() {
                return await fastify.db.profiles.findMany();
              }
            },
            user: {
              type: User,
              args: {
                id: { type: GraphQLID }
              },
              async resolve(_, { id }) {
                const user = await fastify.db.users.findOne({ key: 'id', equals: id });

                if (user === null) {
                  throw fastify.httpErrors.notFound('User does not exsist');
                }

                return user;
              }
            },
            post: {
              type: Post,
              args: {
                id: { type: GraphQLID }
              },
              async resolve(_, { id }) {
                const post = await fastify.db.posts.findOne({ key: 'id', equals: id });

                if (post === null) {
                  throw fastify.httpErrors.notFound('Post does not exsist');
                }

                return post;
              }
            },
            profile: {
              type: Profile,
              args: {
                id: { type: GraphQLID }
              },
              async resolve(_, { id }) {
                const profile = await fastify.db.profiles.findOne({ key: 'id', equals: id });

                if (profile === null) {
                  throw fastify.httpErrors.notFound('Post does not exsist');
                }

                return profile;
              }
            },
            memberType: {
              type: MemberType,
              args: {
                id: { type: GraphQLID }
              },
              async resolve(_, { id }) {
                const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: id });

                if (memberType === null) {
                  throw fastify.httpErrors.notFound('Post does not exsist');
                }

                return memberType;
              }
            },
          }
        }),
      });

      const result = await graphql({
        schema,
        source: request.body.query as any,
        variableValues: request.body.variables,
        contextValue: fastify,
      });

      return result;
    }
  );
};

export default plugin;