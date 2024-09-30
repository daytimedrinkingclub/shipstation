const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function getUserIdFromEmail(email) {
  try {
    const { data, error } = await supabaseClient
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data ? data.id : null;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
}

async function createOrLoginUser(email, name, picture) {
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select()
    .eq('email', email)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    return { error: fetchError };
  }

  if (existingUser) {
    const { data: session, error: signInError } = await supabase.auth.signInWithOtp({
      email: email,
    });

    if (signInError) {
      return { error: signInError };
    }

    return { user: existingUser, session };
  } else {
    const { data: newUser, error: createError } = await supabase.auth.signUp({
      email: email,
      password: crypto.randomBytes(20).toString('hex'),
    });

    if (createError) {
      return { error: createError };
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ name, avatar_url: picture })
      .eq('id', newUser.user.id);

    if (updateError) {
      return { error: updateError };
    }

    return { user: updatedUser, session: newUser.session };
  }
}

module.exports = { supabaseClient, getUserIdFromEmail, createOrLoginUser };
