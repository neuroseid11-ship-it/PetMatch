var { createClient } = require('@supabase/supabase-js');

var url = 'https://lfkwewoaxklwjxrunmyl.supabase.co';
var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxma3dld29heGtsd2p4cnVubXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzA2NjYsImV4cCI6MjA4MjYwNjY2Nn0.-3zDfq1pmnYhk26mxE_h75QQ_AeBCR0U6A_sxue83XU';

var supabase = createClient(url, key);

async function test() {
    console.log("Fetching profiles...");
    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, user_type, partner_profiles(company_name)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success. Rows:", data.length);
        data.forEach(u => {
            console.log(`User: "${u.full_name}" | Type: "${u.user_type}" | Partner: ${u.partner_profiles ? JSON.stringify(u.partner_profiles) : 'NULL'}`);
        });
    }
}

test();
