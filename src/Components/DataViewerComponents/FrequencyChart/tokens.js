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

  if (d) {
    total += d.total;
    count += d.count;
  }

  return { total, count };
}
const addImpairment = addDistress;


export const aggregate = (features, responses, unit, startTime, endTime) => {
  const frequency = [], distress = [], impairment = [], total = [];

  let time = startTime;

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

  for (const response of responses) {
    if (response.date < startTime || response.date >= endTime) {
      continue;
    }

    let index = frequency.findIndex(f => response.date >= f.start && response.date < f.end);

    for (const feature of features) {
      if (response[feature.id] || feature.behaviorOption && response.frequency && response.frequency[feature.id]) { 
        const f = feature.behaviorOption ? response.frequency[feature.id] : 1;

        if (f) {
          total[index] += f;
        }

        frequency[index][feature.id] = addFrequency(
          frequency[index][feature.id],
          f
        );

        distress[index][feature.id] = addDistress(
          distress[index][feature.id],
          feature.behaviorOption ? response.distress[feature.id] : null
        )

        impairment[index][feature.id] = addImpairment(
          impairment[index][feature.id],
          feature.behaviorOption ? response.impairment[feature.id] : null
        )
      }
    }
  }

  const getAverage = (d) => {
    if (!d || !d.count) return 0;
    return d.total / d.count;
  }

  for (let i = 0; i < distress.length; i++) {
    for (const option in distress[i]) {
      distress[i][option] = getAverage(distress[i][option])
      impairment[i][option] = getAverage(impairment[i][option])
    }
  }

  return { frequency, distress, impairment, total }
}
