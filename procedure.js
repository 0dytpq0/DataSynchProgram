const spDwAnimals = (data) => {
  const aniSeq = data[0];
  const animalsArr = data.splice(1);
  const output = '@returnOK';
  animalsArr.push(aniSeq);
  animalsArr.push(output);
  return animalsArr;
};
const spDwHistory = (data) => {
  return data.splice(1);
};
const spDwFeedMove = (data) => {
  const moveSeq = data[0];
  const feedMoveArr = data.splice(1);
  feedMoveArr.push(moveSeq);
  return feedMoveArr;
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
  // const result = moveRobotArrFront + ',' + moveRobotArrBack;
  return moveRobotArrFront;
};
const spDwIndoor = (data) => {
  const cmd = data[0];
  let indoorArr = data.splice(2);
  indoorArr.push('now()');
  indoorArr.push(cmd);

  return indoorArr;
};
const spDwMilking = (data) => {
  const milkSeq = data[0];
  let milkingArr = data.splice(1);
  milkingArr.push(milkSeq);
  return milkingArr;
};
const spDwWater = (data) => {
  const aniSeq = data[0];
  const aniRFID = data[1];
  const waterArr = data.splice(2);
  waterArr.unshift(aniSeq);
  waterArr.push(aniRFID);
  return waterArr;
};

module.exports = {
  spDwAnimals,
  spDwHistory,
  spDwFeedMove,
  spDwFeedMoveRobot,
  spDwIndoor,
  spDwMilking,
  spDwWater,
  spClDwFeedMoverRobot,
};
