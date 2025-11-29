const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://visoxfhymssvunyazgsl.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpc294Zmh5bXNzdnVueWF6Z3NsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzc0ODk0MiwiZXhwIjoyMDc5MzI0OTQyfQ.5P340LoCs2hUqtfjKtGKzCfiNQ9N93qiF6rW3cQciuQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function check() {
  console.log('Checking if creator_videos table exists...');
  const { data, error } = await supabase
    .from('creator_videos')
    .select('count')
    .limit(1);

  if (error) {
    console.log('Error:', error.message);
    if (error.message.includes('relation "creator_videos" does not exist')) {
      console.log('STATUS: MISSING_TABLE');
    } else {
      console.log('STATUS: ERROR');
    }
  } else {
    console.log('Table exists!');
    console.log('STATUS: EXISTS');
  }
}

check();
