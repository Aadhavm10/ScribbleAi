const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'
});

async function main() {
  try {
    // Check if index exists
    const indexExists = await client.indices.exists({ index: 'notes' });
    console.log('Index "notes" exists:', indexExists);
    
    // Count total documents
    const count = await client.count({ index: 'notes' });
    console.log('Total documents in index:', count.count);
    
    // Get all documents
    const result = await client.search({
      index: 'notes',
      body: {
        query: { match_all: {} },
        size: 10
      }
    });
    
    console.log('Documents found:', result.hits.hits.length);
    console.log('Documents:', JSON.stringify(result.hits.hits, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
