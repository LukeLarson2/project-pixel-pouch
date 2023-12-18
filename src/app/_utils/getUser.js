import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const getUser = async () => {
  const supabase = createClientComponentClient();

  // Get the current session
  const session = await supabase.auth.getSession()

  if (!session.data.session) {
    return false;
  }

  const email = session.data.session.user.email

  // Check if there is a session and a user

  // Use the user's ID from the session
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('email', email);

  if (error) {
    console.error(error);
    return;
  }

  return data;
}

export default getUser;
