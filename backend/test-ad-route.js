import { supabaseAdmin } from './src/lib/supabase.js';

async function testAdRoute() {
  const id = '4458ac1d-bd03-49ef-846f-60739ac7397f';
  
  console.log('=== Testing Ad Route Logic ===');
  console.log('Ad ID:', id);
  
  try {
    // Test the exact same query as in the route
    const { data: ad, error } = await supabaseAdmin
      .from('ads')
      .select('*')
      .eq('id', id)
      .single();
    
    console.log('\n=== Raw Supabase Result ===');
    console.log('ad:', ad);
    console.log('error:', error);
    console.log('ad type:', typeof ad);
    console.log('ad is null:', ad === null);
    console.log('ad is undefined:', ad === undefined);
    console.log('ad properties:', ad ? Object.keys(ad) : 'none');
    
    if (error) {
      console.log('\n=== Error Branch ===');
      console.log('Error:', error);
      return;
    }
    
    // Test transformation logic
    console.log('\n=== Transformation Logic ===');
    const transformedAd = ad ? {
      ...ad,
      image: ad.image ? `${process.env.SUPABASE_URL}/storage/v1/object/public/${ad.image}` : null
    } : null;
    
    console.log('transformedAd:', transformedAd);
    console.log('transformedAd type:', typeof transformedAd);
    console.log('transformedAd is null:', transformedAd === null);
    
    // Test response data
    console.log('\n=== Response Data ===');
    const responseData = { ad: transformedAd };
    console.log('responseData:', responseData);
    console.log('responseData.ad:', responseData.ad);
    console.log('JSON.stringify(responseData):', JSON.stringify(responseData));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAdRoute(); 