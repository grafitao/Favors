import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Google Maps API Key not configured on server." }, { status: 500 });
  }

  if (!origin || !destination) {
    return NextResponse.json({ error: "Origin and destination are required." }, { status: 400 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes[0].legs[0]) {
      const leg = data.routes[0].legs[0];
      const distanceInMeters = leg.distance.value;
      const distanceInKm = distanceInMeters / 1000;
      
      return NextResponse.json({ 
        distance: distanceInKm,
        origin_coords: {
          lat: leg.start_location.lat,
          lng: leg.start_location.lng
        },
        destination_coords: {
          lat: leg.end_location.lat,
          lng: leg.end_location.lng
        }
      });
    } else {
      return NextResponse.json({ error: "Could not calculate distance or find route. Check addresses.", details: data }, { status: 400 });
    }
  } catch (err) {
    console.error("Maps API Error:", err);
    return NextResponse.json({ error: "Internal server error calling Maps API." }, { status: 500 });
  }
}
