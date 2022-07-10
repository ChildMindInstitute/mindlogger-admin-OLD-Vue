export const colorMap = {}

//This will be used by calendar components for knowing the color of events
// from their activity types
export const addActivityColor = function(id, color) {
  colorMap[id] = color;
}

export const getEventColor = function(activity_id) {
  let color = colorMap[activity_id]
  if (color) return color;
  Object.keys(colorMap).forEach(key => {
    if (key.includes(activity_id)) {
      color = colorMap[key];
    }
  })
  if (color) return color;
  //default
  return  null;
}