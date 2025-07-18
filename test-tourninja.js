const https = require('https');
const fetch = require('node-fetch');

async function testTourNinjaAPI() {
    const url = 'https://www.tourninja.io/api/public/tours?apiKey=tourninja-showcase-2-amontour&companyId=2';
    
    console.log("Testing Tour Ninja API:", url);
    
    try {
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false
        });
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'AmonTour-Website/1.0'
            },
            agent: httpsAgent
        });
        
        console.log("Response Status:", response.status, response.statusText);
        console.log("Response Headers:", response.headers.raw());
        
        const text = await response.text();
        console.log("Response Body (first 1000 chars):", text.substring(0, 1000));
        
        try {
            const data = JSON.parse(text);
            console.log("Parsed Response:", JSON.stringify(data, null, 2));
            
            if (data.success && data.tours) {
                console.log(`Success! Found ${data.tours.length} tours`);
                data.tours.slice(0, 3).forEach(tour => {
                    console.log(`- ${tour.name}: ${tour.price} ${tour.currency}`);
                });
            }
        } catch (e) {
            console.error("Failed to parse JSON:", e);
        }
        
    } catch (error) {
        console.error("API Error:", error);
    }
}

testTourNinjaAPI();
