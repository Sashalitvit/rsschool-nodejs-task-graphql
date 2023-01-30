import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLOutputType,
} from 'graphql';

const User: GraphQLOutputType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
    userSubscribedTo: {
      type: new GraphQLList(User),
      async resolve(user, _, fastify ) {
        return await fastify.db.users.findMany({key: 'subscribedToUserIds', inArray: user.id});
      }
    },
    subscribedToUser: {
      type: new GraphQLList(User),
      async resolve(user, _, fastify ) {
        return user.subscribedToUserIds.map(async (id: string) => {
          return await fastify.db.users.findOne({key: 'id', equals: id});
        });
      }
    },
    posts: {
      type: new GraphQLList(Post),
      async resolve(user, _, fastify) {
        return await fastify.db.posts.findMany({ key: 'userId', equals: user.id });
      }
    },
    profile: {
      type: Profile,
      async resolve(user, _, fastify) {
        return await fastify.db.profiles.findOne({ key: 'userId', equals: user.id });
      }
    },
    memberType: {
      type: MemberType,
      async resolve(user, _, fastify) {
        const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: user.id });

        if (user.profile === null) {
          return null;
        }

        return await fastify.db.memberTypes.findOne({ key: 'id', equals: profile.memberTypeId });
      }
    }
  }),
});

const Post = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLString },
  }),
});

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLID },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  }),
});

const Profile = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLID },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    userId: { type: GraphQLString },
  }),
});

export { User, Post, MemberType, Profile };