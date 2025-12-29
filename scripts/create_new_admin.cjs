
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lfkwewoaxklwjxrunmyl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxma3dld29heGtsd2p4cnVubXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzA2NjYsImV4cCI6MjA4MjYwNjY2Nn0.-3zDfq1pmnYhk26mxE_h75QQ_AeBCR0U6A_sxue83XU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'neuroseid11@gmail.com';
    console.log(`Tentando registrar ${email} com senha "123456"...`);

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: '123456',
        options: {
            data: {
                full_name: 'Admin Neuroseid'
            }
        }
    });

    if (error) {
        console.error('ERRO:', error.message);
    } else {
        console.log('SUCESSO! Usuário criado.');
        console.log('ID:', data.user?.id);
    }
}

createAdmin();
