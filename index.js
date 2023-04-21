const mysql = require('mysql2/promise');
const moment = require('moment-timezone');
const { filter } = require('jszip');
const dbOriginData = require('./dbData');
const { getColumnType, getColumnNames } = require('./function');
const {
  spDwAnimals,
  spDwHistory,
  spDwFeedMove,
  spDwFeedMoveRobot,
  spDwIndoor,
  spDwMilking,
  spDwWater,
} = require('./procedure');

connectToMysql = async ({ host, user, password, database }) => {
  try {
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
    });
    console.log(`Connected to MySQL db at ${host}`);
    return connection;
  } catch (error) {
    console.log(`Connecting to MySQL db at ${host}Error`);
    throw error;
  }
};
module.exports = connectToMysql;

const Main = async () => {
  const localConnection = await connectToMysql({
    host: 'localhost',
    user: 'root',
    password: 'ekdnsel',
    database: 'dawoon',
  });
  const dx_9999Connection = await connectToMysql({
    host: 'localhost',
    user: 'root',
    password: 'ekdnsel',
    database: 'dx_9999',
  });
  const schemaConnection = await connectToMysql({
    host: 'localhost',
    user: 'root',
    password: 'ekdnsel',
    database: 'information_schema',
  });

  //synch 데이터를 가져옵니다.
  let procedureName = '';
  const [synchRows] = await localConnection.execute(
    'SELECT * FROM dw_synch where tableNm = "dw_water"  LIMIT 10'
  );
  console.log('synchRows.length', synchRows.length);
  let filteredData;
  let dataInfo = [];
  (async () => {
    for (let item of dbOriginData) {
      filteredData = synchRows.filter((x) => item.table === x.tableNm);

      //table name이 같으닊 ㅏ이제 db에서 테이블 name이 같은 것들중에 key값이 같은게 있는지 체크해야함.
      if (filteredData.length > 0) {
        console.log('item.table,item.key', item.table, item.key);
        //         //filteredData에 값들이 많으니 반복문을 돌려서 tableKey1과 item.key가 같은 것들을 배열로 뽑아내야한다.
        let instantArr = [];
        procedureName = 'sp_' + item.table.slice(3);
        if (item.table === 'dw_daily_feed_robot') {
          procedureName = 'sp_' + item.table.slice(3, -5) + 'Robot';
        }
        if (item.table === 'dw_milking_feed') {
          procedureName = item.table + '_SP';
        }
        if (
          item.table === 'dw_milking_report1' ||
          item.table === 'dw_milking_report2' ||
          item.table === 'dw_milking_report3' ||
          item.table === 'dw_milking_report4' ||
          item.table === 'dw_milking_report5' ||
          item.table === 'dw_milking_report6' ||
          item.table === 'dw_milking_report8' ||
          item.table === 'dw_milking_report9'
        ) {
          procedureName = item.table + '_SP';
        }
        for (const data of filteredData) {
          const result = await localConnection.execute(
            `SELECT * FROM ${item.table} WHERE ${item.key} = ${Number(
              data.tableKey1
            )}`
          );
          result[0].length > 0 ? instantArr.push(result[0]) : null;
        }
        dataInfo = [...instantArr];
        //이제 dataInfo만큼 돌려서 값을 넣어주면 된다.
        console.log('dataInfo.length', dataInfo.length);
        if (dataInfo.length) {
          for (const data of dataInfo) {
            let result;
            const tableColumns = await schemaConnection.execute(
              `SELECT COLUMN_NAME,DATA_TYPE FROM COLUMNS WHERE TABLE_NAME='${item.table}' and table_schema='dawoon' ORDER BY ordinal_position ASC;`
            );
            const columnNames = await getColumnNames(
              tableColumns[0],
              item.table
            );
            const columnTypes = await getColumnType(tableColumns[0]);
            const columnNamesString = await columnNames.join(',');
            let valuesString = await Promise.all(
              columnNames.map(async (name) => {
                let value = data[0][name];

                if (columnTypes.includes(name)) {
                  value = Number(value);
                }

                if (typeof value === 'string') {
                  return `'${value}'`;
                } else if (value instanceof Date) {
                  return `'${value
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', '')}'`;
                } else {
                  return value;
                }
              })
            );
            if (item.table === 'dw_animals') {
              valuesString = await spDwAnimals(valuesString);
            } else if (item.table === 'dw_history') {
              valuesString = await spDwHistory(valuesString);
            } else if (item.table === 'dw_feed_move') {
              valuesString = await spDwFeedMove(valuesString);
            } else if (item.table === 'dw_feed_move_robot') {
              valuesString = await spDwFeedMoveRobot(valuesString);
            } else if (item.table === 'dw_indoor') {
              valuesString = await spDwIndoor(valuesString);
            } else if (item.table === 'dw_milking') {
              valuesString = await spDwMilking(valuesString);
            } else if (item.table === 'dw_water') {
              valuesString = await spDwWater(valuesString);
            }

            const joinedValuesString = valuesString.join(', ');
            if (item.table === 'dw_test') {
              await dx_9999Connection.execute(`CALL ${procedureName}`);
            } else {
              await dx_9999Connection.execute(
                `CALL ${procedureName}(${joinedValuesString})`
              );
            }
          }
        }
      }
      // await synchRows.map(async (item) => {
      //   await localConnection.execute(
      //     `INSERT INTO dw_synch_backup (synchSeq, tableNm, tableKey1, tableKey2, issueDate,
      //       applyFlag, applyDate, checkFlag, checkDate) VALUES (${item.synchSeq},  '${item.tableNm}', '${item.tableKey1}','1', NOW(), '${item.applyFlag}'
      //       , ${item.applyDate}, '${item.checkFlag}',  ${item.checkDate})`
      //   );
      // });
      // await localConnection.execute(
      //   'DELETE FROM dw_synch WHERE tableNm = "dw_animals" LIMIT 5'
      // );
    }
  })();
  // await localConnection.execute(
  //   'SELECT * FROM dw_synch where tableNm = "dw_animals"  LIMIT 5'
  // );
};

Main();
