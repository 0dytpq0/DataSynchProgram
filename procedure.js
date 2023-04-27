const spDwAnimals = (data) => {
  const aniSeq = data[0];
  const animalsArr = data.splice(1);
  const output = '@returnOK';
  animalsArr.push(aniSeq);
  animalsArr.push(output);
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
  console.log(data[66]);
  const milkingSetArr = data;
  milkingSetArr.splice(65, 1, milkingCheckTime1);
  milkingSetArr.splice(66, 1, milkingCheckTime2);
  return milkingSetArr;
};
const spDwFeedMoveRobot = async (data) => {
  const moveSeq = data[0];
  let moveRobotArr = data.splice(1);
  let subArr = moveRobotArr.splice(-2);

  moveRobotArr = moveRobotArr.splice(0, 12);
  await subArr.map((item) => {
    moveRobotArr.push(item);
  });
  await moveRobotArr.push(moveSeq);
  return moveRobotArr;
};
const spClDwFeedMoverRobot = async (data) => {
  const moveRobotArrBack = data.splice(-4);
  const moveRobotArrFront = data.splice(0, 16);
  moveRobotArrFront.push(...moveRobotArrBack);
  return moveRobotArrFront;
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
  console.log(alertArr);
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
