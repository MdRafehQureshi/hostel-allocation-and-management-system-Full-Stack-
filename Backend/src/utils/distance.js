async function getCoordinatesOpenCage(address) {
    const apiKey = process.env.GEOCODE_API_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results.length > 0) {
        return {
            lat: data.results[0].geometry.lat,
            lon: data.results[0].geometry.lng
        };
    } else {
        throw new Error('Address not found');
    }
  }

  function haversineDistance(coords1, coords2) {
    const R = 6371; // Radius of the Earth in kilometers
    const lat1 = coords1.lat * Math.PI / 180;
    const lon1 = coords1.lon * Math.PI / 180;
    const lat2 = coords2.lat * Math.PI / 180;
    const lon2 = coords2.lon * Math.PI / 180;
  
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
  
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c;
    return distance;
  }
  

  export { getCoordinatesOpenCage,haversineDistance }