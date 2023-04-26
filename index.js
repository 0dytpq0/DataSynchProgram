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
  spClDwFeedMoverRobot,
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
// module.exports = connectToMysql;

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
  const dw_3974Connection = await connectToMysql({
    host: 'localhost',
    user: 'root',
    password: 'ekdnsel',
    database: 'dw_3974',
  });
  const schemaConnection = await connectToMysql({
    host: 'localhost',
    user: 'root',
    password: 'ekdnsel',
    database: 'information_schema',
  });
  const callProcedureDX = async (tableNm, tableKey) => {
    let procedureName = 'sp_' + tableNm.slice(3);
    if (tableNm === 'dw_daily_feed_robot') {
      procedureName = 'sp_' + tableNm.slice(3, -5) + 'Robot';
    }
    if (
      tableNm === 'dw_milking_feed' ||
      tableNm === 'dw_breeding' ||
      tableNm === 'dw_biu' ||
      tableNm === 'dw_smslog' ||
      tableNm === 'dw_rumination'
    ) {
      procedureName = tableNm + '_SP';
    }
    if (
      tableNm === 'dw_milking_report1' ||
      tableNm === 'dw_milking_report2' ||
      tableNm === 'dw_milking_report3' ||
      tableNm === 'dw_milking_report4' ||
      tableNm === 'dw_milking_report5' ||
      tableNm === 'dw_milking_report6' ||
      tableNm === 'dw_milking_report8' ||
      tableNm === 'dw_milking_report9'
    ) {
      procedureName = tableNm + '_SP';
    }

    let procedureNameDw = 'sp_cl_' + tableNm.slice(3);
    //moveSeq를 어떤 변수를 넣어야 될까?

    const tableColumns = await schemaConnection.execute(
      `SELECT COLUMN_NAME,DATA_TYPE FROM COLUMNS WHERE TABLE_NAME='${tableNm}' and table_schema='dawoon' ORDER BY ordinal_position ASC;`
    );
    //dx_9999 columnNames 구함
    const columnNames = await getColumnNames(tableColumns[0], tableNm, 'no');

    const columnTypes = await getColumnType(tableColumns[0]);

    const data = await localConnection.execute(
      `SELECT * FROM ${tableNm} WHERE ${tableKey} = ${tableColumns[0][0].COLUMN_NAME}`
    );
    let valuesString;
    try {
      valuesString = await Promise.all(
        columnNames.map(async (name) => {
          let value = data[0][0][name];
          if (columnTypes.includes(name)) {
            value = Number(value);
          }

          if (typeof value === 'string') {
            return `'${value}'`;
          } else if (value instanceof Date) {
            return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
          } else {
            return value;
          }
        })
      );

      //procedure에 넣을 params 순서맞춤.
      if (tableNm === 'dw_animals') {
        valuesString = await spDwAnimals(valuesString);
      } else if (tableNm === 'dw_history') {
        valuesString = await spDwHistory(valuesString);
      } else if (tableNm === 'dw_feed_move') {
        valuesString = await spDwFeedMove(valuesString);
      } else if (tableNm === 'dw_feed_move_robot') {
        valuesString = await spDwFeedMoveRobot(valuesString);
      } else if (tableNm === 'dw_indoor') {
        valuesString = await spDwIndoor(valuesString);
      } else if (tableNm === 'dw_milking') {
        valuesString = await spDwMilking(valuesString);
      } else if (tableNm === 'dw_water') {
        valuesString = await spDwWater(valuesString);
      }

      let joinedValuesString = valuesString.join(', ');
      await dx_9999Connection.execute(
        `CALL ${procedureName}(${joinedValuesString})`
      );
    } catch (error) {
      console.log('error', error, tableNm);
    }
  };
  const callProcedureDW = async (tableNm, tableKey) => {
    let procedureName = 'sp_cl_' + tableNm.slice(3);
    //moveSeq를 어떤 변수를 넣어야 될까?

    const tableColumns = await schemaConnection.execute(
      `SELECT COLUMN_NAME,DATA_TYPE FROM COLUMNS WHERE TABLE_NAME='${tableNm}' and table_schema='dawoon' ORDER BY ordinal_position ASC;`
    );
    //dx_9999 columnNames 구함
    const columnNames = await getColumnNames(tableColumns[0], tableNm, 'yes');
    const columnTypes = await getColumnType(tableColumns[0]);
    const data = await localConnection.execute(
      `SELECT * FROM ${tableNm} WHERE ${tableKey} = ${tableColumns[0][0].COLUMN_NAME}`
    );

    let valuesString;
    try {
      valuesString = await Promise.all(
        columnNames.map(async (name) => {
          let value = data[0][0][name];

          if (columnTypes.includes(name)) {
            value = Number(value);
          }

          if (typeof value === 'string') {
            return `'${value}'`;
          } else if (value instanceof Date) {
            return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
          } else {
            return value;
          }
        })
      );

      //procedure에 넣을 params 순서맞춤.
      if (tableNm === 'dw_feed_move_robot') {
        valuesString = await spClDwFeedMoverRobot(valuesString);
        procedureName = 'sp_cl_feed_move';
      }

      let joinedValuesString = valuesString.join(', ');
      //dw_3974에 넣을 columnNames 구함 3번째 params가 그에 관한 것임
      await dw_3974Connection.execute(
        `CALL ${procedureName}(${joinedValuesString})`
      );
    } catch (error) {
      console.log('error', error, tableNm);
    }
  };

  // where tableNm = "dw_device_config"
  //synch 데이터를 가져옵니다.
  //1 synch에서 데이터를 가져온다.
  (async () => {
    while (true) {
      const [synchRows] = await localConnection.execute(
        'SELECT * FROM dw_synch where tableNm = "dw_milking_do_info" LIMIT 1'
      );
      console.log('synchRows.length', synchRows.length);

      for (let item of synchRows) {
        //여기서 함수가 실행이 되어야된다.(table 이름에 따른 함수)
        await callProcedureDX(item.tableNm, item.tableKey1);
        await callProcedureDW(item.tableNm, item.tableKey1);
        // await localConnection.execute(
        //   `DELETE FROM dw_synch where synchSeq = ${item.synchSeq}`
        // );
        // await localConnection.execute(
        //   `INSERT INTO dw_synch_backup values(${item.synchSeq},'${item.tableNm}','${item.tableKey1}','${item.tableKey2}',now(),'${item.applyFlag}',${item.applyDate},'${item.checkFlag}',${item.checkDate})`
        // );

        // await localConnection.execute(
        //   `CALL sp_Synch('${item.tableNm}','${item.tableKey1}','${item.tableKey2}','${item.applyFlag}','${item.checkFlag}',${item.synchSeq}
        //   )`
        // );
      }

      if (synchRows.length < 100) {
        console.log('모든 작업을 마쳤습니다.');
        break;
      }
    }
  })();
};

Main();
