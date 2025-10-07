import NextAuth from "next-auth"
import KakaoProvider from "next-auth/providers/kakao"
import { upsertUserProfile } from "@/lib/actions/profile"
import { generateNicknameWithNumber } from "@/lib/utils/nickname"

// Debug environment variables
console.log("NextAuth Environment Variables:")
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET")
console.log("KAKAO_CLIENT_ID:", process.env.KAKAO_CLIENT_ID ? "SET" : "NOT SET")
console.log("KAKAO_CLIENT_SECRET:", process.env.KAKAO_CLIENT_SECRET ? "SET" : "NOT SET")

// Validate Kakao credentials
if (!process.env.KAKAO_CLIENT_ID || process.env.KAKAO_CLIENT_ID === 'your_kakao_rest_api_key' || process.env.KAKAO_CLIENT_ID === 'REPLACE_WITH_YOUR_ACTUAL_KAKAO_REST_API_KEY') {
  console.error("❌ KAKAO_CLIENT_ID is not set or is using placeholder value!")
  console.error("Please set KAKAO_CLIENT_ID to your actual Kakao REST API key in .env.local")
}

export const authOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/signin'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.id = profile.id
        token.sub = profile.id // Ensure we have a stable user ID
        
        // Fetch nickname from profile if available
        if (token.sub) {
          try {
            const { getSupabaseServer } = await import('@/lib/supabase-server')
            const supabase = getSupabaseServer()
            const { data: profileData } = await supabase
              .from('profiles')
              .select('nickname')
              .eq('id', token.sub)
              .single()
            
            if (profileData?.nickname) {
              token.nickname = profileData.nickname
            } else {
              // 닉네임이 없으면 새로 생성
              const newNickname = generateNicknameWithNumber()
              token.nickname = newNickname
            }
          } catch (error) {
            console.error('Error fetching nickname:', error)
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.id = token.id
      session.user.nickname = token.nickname
      return session
    },
    async signIn({ user, account, profile }) {
      // Upsert user profile on successful login
      if (account?.provider === 'kakao' && profile) {
        try {
          await upsertUserProfile({
            id: profile.id as string,
            email: profile.email || null,
            name: profile.name || null,
            avatar_url: profile.picture || null
          })
        } catch (error) {
          console.error('Error upserting user profile during sign in:', error)
          // Don't block login if profile upsert fails
        }
      }
      return true
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

