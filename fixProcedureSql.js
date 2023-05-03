const spDwAnimals = (data, seq) => {
  let aniSeq;
  seq === undefined ? (aniSeq = 0) : (aniSeq = data[0]);
  const animalsArr = data.splice(1);
  const output = '@returnOK';
  animalsArr.push(aniSeq, output);
  return animalsArr;
};
const spDeviceConfig = (data) => {
  const devArr = data.splice(1);
  devArr.push(0);
  return devArr;
};

const spDwFeedMove = (data) => {
  const moveSeq = data[0];
  const feedMoveArr = data.splice(1);
  feedMoveArr.push(moveSeq);
  return feedMoveArr;
};
const spDwMilkingSet = async (data) => {
  const milkingCheckTime1 = data[66];
  const milkingCheckTime2 = data[65];
  const milkingSetArr = [...data];
  milkingSetArr.splice(65, 1, milkingCheckTime1);
  milkingSetArr.splice(66, 1, milkingCheckTime2);
  return milkingSetArr;
};
const spDwFeedMoveRobot = async (data) => {
  const moveSeq = data[0];
  const moveRobotArr = data.slice(1, 13);
  const subArr = data.slice(-2);

  moveRobotArr.push(...subArr, moveSeq);
  return moveRobotArr;
};
const spClDwFeedMoverRobot = async (data) => {
  const moveRobotArrBack = data.slice(-4);
  const moveRobotArrFront = data.slice(0, 16);
  return [...moveRobotArrFront, ...moveRobotArrBack];
};
const spDwWater = (data) => {
  const aniSeq = data[0];
  const aniRFID = data[1];
  const waterArr = data.splice(2);
  waterArr.unshift(aniSeq);
  waterArr.push(aniRFID);
  return waterArr;
};
const spDwBreeding = (data) => {
  data.splice(20, 1, 'now()');
  return data;
};
const spDwDeviceAlert = (data) => {
  const alertArr = data.splice(1);
  alertArr.push(0);
  alertArr.splice(2, 0, 'now()');
  return alertArr;
};
module.exports = {
  spDwAnimals,
  spDwFeedMove,
  spDwFeedMoveRobot,
  spDwWater,
  spClDwFeedMoverRobot,
  spDwBreeding,
  spDeviceConfig,
  spDwDeviceAlert,
  spDwMilkingSet,
};
