import {Author, JsonPost, Category} from '../models/author-posts';

export const MOCK_POSTS: JsonPost[] = [
  {id: 1, authorId: 1, categoryIds: [2, 3], title: "TypeScript: JavaScript Development at Application Scale", text: "Today, we’re introducing a new programming language that solves a very specific problem – getting JavaScript development to scale. That language is TypeScript. "},
  {id: 2, authorId: 2, categoryIds: [2, 3], title: "TypeScript Types Explained – A Mental Model to Help You Think in Types", text:"This post is my attempt to help developers think more in types and understand this mental model."} ,
  {id: 3, authorId: 2, categoryIds: [1, 3], title: "Functional Programming Principles in Javascript", text: "In this post, I will tell you more about functional programming, and some important concepts, with a lot of code examples in JavaScript."},
  {id: 4, authorId: 3, categoryIds: [2, 3], title: "Ten Years of TypeScript", text: "But this birthday is a special one – 10 years ago today, on October 1st, 2012, TypeScript was unveiled publicly for the first time."},
  {id: 5, authorId: 4, categoryIds: [2, 3, 4], title: "Announcing Capacitor 4.0", text: "Today, we’re thrilled to announce the release of Capacitor 4.0 🎉. This new major version brings not only a bunch of bug fixes and improvements to the overall codebase, but also bumps the minimum SDK targets to support new Google Play policies."},
];
export const MOCK_CATEGORIES: Category[] = [
  {id: 1, name: "Javascript"},
  {id: 2, name: "Typescript"},
  {id: 3, name: "Programming"},
  {id: 4, name: "Java"},
];
export const MOCK_AUTHORS: Author[] = [
  {id: 1, name: "S.Somasegar", email: "s.somasegar@example.com"},
  {id: 2, name: "TK", email: "tk@example.com"},
  {id: 3, name: "Daniel Rosenwasser", email: "d.rosenwasser@example.com"},
  {id: 4, name: "Mike Hartington", email: "m.hartington@example.com"},
];
