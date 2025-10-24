const fetch = require('node-fetch');

async function testSearch() {
  try {
    // Get user token first (assuming you're logged in)
    const response = await fetch('http://localhost:3002/search/hybrid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth header if needed - need to get actual token
      },
      body: JSON.stringify({
        query: 'operating systems',
        limit: 10
      })
    });

    const result = await response.json();
    console.log('Search response status:', response.status);
    console.log('Search result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Search test error:', error.message);
  }
}

testSearch();
