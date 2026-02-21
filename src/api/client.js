// initializing the client that we'll use to make api calls to the supabase project

import {createClient} from "@supabase/supabase-js";

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON
);

export default client; 

// A function that will be useful for creating a dropdown for admins to pick clients from
export async function getClientsForDropdown() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON
  )

  const { data, error } = await supabase.rpc(
    'get_clients_for_dropdown' // name of the function that was made in SQL
  )

  if (error) {
    throw error
  }

  return data
}