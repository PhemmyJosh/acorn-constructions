// Real, royalty-free construction photography sourced from Pexels, curated for
// authenticity to Western Canadian residential/agricultural construction.
// Swap these for real Acorn project photos as they become available.

function pexelsUrl(id: number, width = 1600): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

export const photos = {
  // Category / service hero images
  residentialFraming: pexelsUrl(27938317),
  foundations: pexelsUrl(29735767),
  postFrame: pexelsUrl(10172663),

  // Feature / atmosphere images
  trussInterior: pexelsUrl(8830259),
  framingDetail: pexelsUrl(17410734),
  crewOnTrusses: pexelsUrl(8829896),
  crewOnTrussesPlayful: pexelsUrl(8830265),
  crewBuildingByLake: pexelsUrl(8817828),
  circularSawByLake: pexelsUrl(8820172),
  crewWithFinishedHouses: pexelsUrl(17410739),
  workerWithBlueprints: pexelsUrl(6474449),

  // Detail / craftsmanship shots
  measuringDetail: pexelsUrl(5973903),
  hammeringDetail: pexelsUrl(5974343),
  respiratorWorker: pexelsUrl(4981787),
  workshopMachine: pexelsUrl(7480448),
  drillingDetail: pexelsUrl(5974047),
  concreteWallTexture: pexelsUrl(16001335),

  // Landscape / context
  corrugatedMetalBuilding: pexelsUrl(18289258),
  aerialFarmland: pexelsUrl(28412626),
  bwPrairie: pexelsUrl(30464341),
};
