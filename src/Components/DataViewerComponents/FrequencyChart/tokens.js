import * as moment from 'moment';

export const addTime = (current, unit) => {
  if (unit == '5mins') {
    return moment.utc(current).add(5, 'minutes').toDate();
  }

  return moment.utc(current).add(1, `${unit}s`).toDate();
}

const addFrequency = (current, f) => (current || 0) + f
const addDistress = (current, d) => {
  let { total, count } = (current || { total: 0, count: 0 })

  if (d !== null) {
    total += d;
    count += 1;
  }

  return { total, count };
}
const addImpairment = addDistress;


export const aggregate = (features, responses, unit, startTime, endTime) => {
  const frequency = [], distress = [], impairment = [], total = [];

  let time = startTime, day = 86400 * 1000;

  while( time < endTime ) {
    const next = addTime(time, unit)

    const obj = {
      start: time,
      end: next,
    }

    for (const feature of features) {
      obj[feature.id] = 0;
    }

    frequency.push(obj)
    distress.push({ ...obj })
    impairment.push({ ...obj })
    total.push(0)

    time = next;
  }

  const getIndex = (time) => frequency.findIndex(f => time >= f.start && time < f.end);

  for (const response of responses) {
    if (response.date < startTime || response.date >= endTime + day) {
      continue;
    }

    let timeIndex = getIndex(response.date);

    for (const feature of features) {
      if (feature.behaviorOption) { // behavior tracker
        const values = response[feature.id] || [];

        for (const value of values) {
          let index = value.time ? getIndex(value.time) : timeIndex;

          if (value.time && value.time < startTime || index < 0) {
            continue;
          }

          total[index] += 1;
          frequency[index][feature.id] = addFrequency(
            frequency[index][feature.id], 1
          );

          distress[index][feature.id] = addDistress(distress[index][feature.id], value.distress);
          impairment[index][feature.id] = addImpairment(impairment[index][feature.id], value.impairment);
        }
      } else if (response[feature.id] && timeIndex >= 0) { // radio & checkbox item with token value option
        total[timeIndex] += 1;

        frequency[timeIndex][feature.id] = addFrequency(
          frequency[timeIndex][feature.id],
          1
        );
      }
    }
  }

  const getAverage = (d) => {
    if (!d || !d.count) return 0;
    return (d.total / d.count).toFixed(3);
  }

  for (let i = 0; i < distress.length; i++) {
    for (const option in distress[i]) {
      distress[i][option] = getAverage(distress[i][option])
      impairment[i][option] = getAverage(impairment[i][option])
    }
  }

  return { frequency, distress, impairment, total }
}
