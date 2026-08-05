import json
import os
from geocodio import Geocodio
from geojson import Point

FILENAME = "../media.geojson"
GEOCODIO_API_KEY = os.environ["GEOCODIO_API_KEY"]  # Create at https://www.geocod.io/

# Each feature is a GeoJSON Feature object, which has a geometry and a set of properties.
# If the feature geometry does not yet have coordinates assigned, we need to try to fetch
# those coordinates, using the location information stored in the properties, by making
# calls to the Geocodio API.
def GeoCode(geocodio_client, feature):
   # Only fetch geocodes for features that do not already have coordinates
   if feature["geometry"]["coordinates"]:
      return

   state = feature["properties"]["state"]
   county = feature["properties"]["county"]
   city = feature["properties"]["city"]

   # We have to have at least a state to try geocoding
   if not state:
      return

   # Construct the request
   address = state
   if county:
      address = county + " County, " + address
   if city:
      address = city + " , " + address

   try:
      response = geocodio_client.geocode(address)
      location = response.results[0].location
      feature["geometry"] = Point((location.lng, location.lat))
   except Exception as error:
      print(error)


if __name__ == "__main__":
   geocodio_client = Geocodio(GEOCODIO_API_KEY)

   blob = {}
   with open(FILENAME, mode="r") as f:
      blob = json.load(f)
      for feature in blob["features"]:
         GeoCode(geocodio_client, feature)

   with open(FILENAME, mode="w") as f:
      # If you don't have the "ensure_ascii=False" argument, JSON dump replaces
      # characters like ":" with unicode
      json.dump(blob, f, indent=2, ensure_ascii=False)