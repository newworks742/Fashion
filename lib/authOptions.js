// lib/authOptions.js
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { compare } from "bcrypt";
// import pool from "./db"; 
// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       id: "credentials",
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;
//         try {
//           const res = await pool.query(
//             `SELECT id, email, password_hash, first_name FROM users WHERE email = $1 LIMIT 1`,
//             [credentials.email]
//           );
//           const user = res.rows[0];
//           if (!user || !user.password_hash) return null;
//           const valid = await compare(credentials.password, user.password_hash);
//           if (!valid) return null;
//           return { id: user.id, email: user.email, name: user.first_name || user.email , phone:user.phone };
//         } catch (err) {
//           console.error("authorize error:", err);
//           return null;
//         }
//       },
//     }),
//   ],

//   session: {
//     strategy: "jwt",
//   },

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) token.id = user.id;
//       return token;
//     },
//     async session({ session, token }) {
//       if (token?.id) session.user.id = token.id;
//       return session;
//     },
//   },

//   pages: {
//     signIn: "/login", // optional custom page
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };

// export default function nextAuthHandler(req, res) {
//   return NextAuth(req, res, authOptions);
// }







import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import pool from "./db"; 

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }
        
        try {
          const res = await pool.query(
            `SELECT id, email, password_hash, first_name, phone FROM users WHERE email = $1 LIMIT 1`,
            [credentials.email]
          );
          
          const user = res.rows[0];
          
          if (!user) {
            throw new Error("No account found with this email");
          }
          
          if (!user.password_hash) {
            throw new Error("Invalid account configuration");
          }
          
          const valid = await compare(credentials.password, user.password_hash);
          
          if (!valid) {
            throw new Error("Incorrect password");
          }
          
          return { 
            id: user.id, 
            email: user.email, 
            name: user.first_name || user.email,
            phone: user.phone 
          };
        } catch (err) {
          if (err.message.includes("No account found") || 
              err.message.includes("Incorrect password") ||
              err.message.includes("Please enter")) {
            throw err;
          }
          console.error("authorize error:", err);
          throw new Error("Authentication failed. Please try again");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    // Remove or comment out the error page to prevent redirects
    // error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default function nextAuthHandler(req, res) {
  return NextAuth(req, res, authOptions);
}


// lib/authOptions.js
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { compare } from "bcrypt";
// import pool from "./db";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       id: "credentials",
//       name: "Credentials",
//       credentials: { email: {}, password: {} },
//       async authorize(credentials) {
//        const res = await pool.query(
//     `SELECT id, email, password_hash, first_name 
//      FROM users WHERE email = $1 LIMIT 1`,
//     [credentials.email]
//   );
//         const user = res.rows[0];
//         console.log('authorize user from DB:', user);
//         if (!user) return null;
//         const ok = await compare(credentials.password, user.password_hash);
//         if (!ok) return null;
//         return { id: user.id, email: user.email, name: user.first_name || user.email};
//       }
//     })
//   ],
  
//   session: { strategy: "jwt" },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.name = user.name;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.user = {
//         id: token.id,
//         email: token.email,
//         name: token.name,
        
//       };
//       return session;
//     }
//   },
//   secret: process.env.NEXTAUTH_SECRET
// };
// export default function handler(req, res) {
//   return NextAuth(req, res, authOptions);
// }
