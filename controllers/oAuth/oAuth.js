const passport = require("passport");
const User = require("../../models/user");
const Role = require("../../models/role");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;
const messages = require("../../constants/messages.js");  
const { auth, error: errorMessages, user } = messages;

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          throw new Error(auth.userNotFound);  
        }

        if (!profile.photos || profile.photos.length === 0) {
          throw new Error(errorMessages.defaultError);  
        }

        const email = profile.emails[0].value;

        let user = await User.findOne({ email }).populate("role");

        if (!user) {
          const defaultRole = await Role.findOne({ name: "student" });

          user = await User.create({
            name: profile.displayName || "No Name",
            email,
            password: "GOOGLE_AUTH",
            gender: "Male",
            phone: "0000000000",
            address: "Not provided",
            image: profile.photos[0]?.value || null,
            role: defaultRole?._id,
            isEmailVerified: true,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
