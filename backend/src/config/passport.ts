import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleId = profile.id;
                const email = profile.emails?.[0]?.value || "";
                const name = profile.displayName;

                let user = await prisma.user.findUnique({ where: { googleId } });
                if (!user) {
                    user = await prisma.user.create({
                        data: { googleId, email, name },
                    });
                }
                console.log("GOOGLE CALLBACK:", process.env.GOOGLE_CALLBACK_URL);

                return done(null, user);
            } catch (err) {
                return done(err, undefined);
            }
        }
    )
);

// Serialize & deserialize 
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
