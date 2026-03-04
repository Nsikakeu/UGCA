
import supabase from './supabase';

async function checkTerms() {
  const { data: terms, error } = await supabase.from('terms').select('*');
  if (error) {
    console.error('Error fetching terms:', error);
  } else {
    console.log('Terms in DB:', JSON.stringify(terms, null, 2));
  }
}

checkTerms();
