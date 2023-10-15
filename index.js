const mysql = require('mysql2/promise');
const moment = require('moment-timezone');
const { filter } = require('jszip');
const dbOriginData = require('./dbData');
const {
  getColumnType,
  getColumnNames,
  getValuesString,
  reFormDate,
} = require('./function');
const {
  spDwAnimals,
  spDwFeedMove,
  spDwFeedMoveRobot,
  spDwWater,
  spClDwFeedMoverRobot,
  spDwBreeding,
  spDeviceConfig,
  spDwDeviceAlert,
  spDwMilkingSet,
} = require('./procedure');

//Sql서버에 접속하는 함수
connectToMysql = async ({ host, user, password, database }) => {
  try {
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
    });
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
    password: '',
    database: '',
  });

  const schemaConnection = await connectToMysql({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '',
  });

  //Dx서버에 데이터 동기화 시키는 함수.
  const callProcedureDX = async (tableNm, tableKey, connection) => {
    //procedure의 이름을 테이블에 따라 설정해준다.
    let procedureName = 'sp_' + tableNm.slice(3);
    if (tableNm === 'dw_daily_feed_robot') {
      procedureName = 'sp_' + tableNm.slice(3, -5) + 'Robot';
    }
    if (
      tableNm === 'dw_breeding' ||
      tableNm === 'dw_biu' ||
      tableNm === 'dw_smslog' ||
      tableNm === 'dw_milking_report1' ||
      tableNm === 'dw_milking_report4' ||
      tableNm === 'dw_milking_report8' ||
      tableNm === 'dw_milking_report_all__daily' ||
      tableNm === 'dw_animals_extra'
    ) {
      procedureName = tableNm + '_SP';
    }
    if (tableNm === 'dw_device_alert') {
      procedureName = 'sp_deivce_alert';
    }
    if (tableNm === 'dw_milkingsets') {
      procedureName = 'dw_milkingsetsROBOT_Insert_SP';
    }
    if (tableNm === 'dw_milking_report_all') {
      procedureName = 'dw_milking_report_all_SPX';
    }
    if (tableNm === 'log_animals') {
      procedureName = 'sp_log_animals';
    }
    //SchemaInformation db에서 synch에서 가져온 table의 컬럼 이름들과 타입들을 가져온다.
    const tableColumns = await schemaConnection.execute(
      `SELECT COLUMN_NAME,DATA_TYPE FROM COLUMNS WHERE TABLE_NAME='${tableNm}' and table_schema='dawoon' ORDER BY ordinal_position ASC;`
    );

    //위에서 가져온 이름들중에 procedure에서 사용하는 매개변수에 맞게 삭제할 것들은 삭제하며 맞춰주다.
    const columnNames = await getColumnNames(tableColumns[0], tableNm, 'no');
    console.log('columnNames' + tableNm, columnNames);

    //decimal타입이 String타입으로 들어와서 varchar,datetime이 아닌 값들을 columnTypes에 배열로 할당해준다.
    //아래에서 Types에 값이 있다면 Number로 설정해줄 것이다.
    const columnTypes = await getColumnType(tableColumns[0]);

    //synch에서 가져온 synchSeq와 해당 synch의 테이블이름과 같은 테이블의 seq를 비교하여
    //서로 같은 값이 있다면 data로 할당한다.
    const data = await localConnection.execute(
      `SELECT * FROM ${tableNm} WHERE ${tableKey} = ${tableColumns[0][0].COLUMN_NAME}`
    );
    // dw_breeding에 regDate 가 0000-00-00 00:00:00 이 들어오면 invalid Date가 반환되서 미리 now()로 수정

    //data에 값이 있는지 검사후 실행하도록 한다.
    //data에 있는 컬럼들의 값들을 valueString에 넣어주되 타입에 맞게 value를 수정해준다

    try {
      let valuesString = await getValuesString(columnNames, columnTypes, data);
      console.log('valuesString' + tableNm, valuesString);
      //procedure에 넣을 value(매개변수)들의 순서맞춤.
      if (tableNm === 'dw_animals') {
        const existAniSeq = await connection.execute(
          `SELECT aniSeq FROM dw_animals WHERE aniSeq = ${tableKey}`
        );
        console.log('existAniSeq', existAniSeq[0][0]);
        valuesString = await spDwAnimals(valuesString, existAniSeq[0][0]);
      } else if (tableNm === 'dw_device_alert') {
        valuesString = await spDwDeviceAlert(valuesString);
      } else if (tableNm === 'dw_device_config') {
        valuesString = await spDeviceConfig(valuesString);
      } else if (tableNm === 'dw_feed_move') {
        valuesString = await spDwFeedMove(valuesString);
      } else if (tableNm === 'dw_feed_move_robot') {
        valuesString = await spDwFeedMoveRobot(valuesString);
      } else if (tableNm === 'dw_water') {
        valuesString = await spDwWater(valuesString);
      } else if (tableNm === 'dw_breeding') {
        valuesString = await spDwBreeding(valuesString);
      } else if (tableNm === 'dw_milkingsets') {
        valuesString = await spDwMilkingSet(valuesString);
      }
      //매개변수들을 string으로 변환 후 프로시져를 호출한다.
      let joinedValuesString = valuesString.join(', ');
      if (tableNm === 'dw_milking_do_info') {
        await connection.execute(
          `INSERT INTO dw_milking_do_info values(${joinedValuesString})`
        );
        return;
      } else if (tableNm === 'dw_water2') {
        await connection.execute(
          `INSERT INTO dw_water2 values(${joinedValuesString})`
        );
      }
      console.log(`CALL ${procedureName}(${joinedValuesString})`);
      await connection.execute(`CALL ${procedureName}(${joinedValuesString})`);
    } catch (error) {
      console.log('error', error, tableNm);
    }
  };
  const callProcedureDW = async (tableNm, tableKey, connection) => {
    //procedure의 이름을 테이블에 따라 설정해준다.
    let procedureName = 'sp_cl_' + tableNm.slice(3);

    //SchemaInformation db에서 synch에서 가져온 table의 컬럼 이름들과 타입들을 가져온다.
    const tableColumns = await schemaConnection.execute(
      `SELECT COLUMN_NAME,DATA_TYPE FROM COLUMNS WHERE TABLE_NAME='${tableNm}' and table_schema='dawoon' ORDER BY ordinal_position ASC;`
    );

    //위에서 가져온 이름들중에 procedure에서 사용하는 매개변수에 맞게 삭제할 것들은 삭제하며 맞춰주다.
    const columnNames = await getColumnNames(tableColumns[0], tableNm, 'yes');

    //decimal타입이 String타입으로 들어와서 varchar,datetime이 아닌 값들을 columnTypes에 배열로 할당해준다.
    //아래에서 Types에 값이 있다면 Number로 설정해줄 것이다.
    const columnTypes = await getColumnType(tableColumns[0]);

    //synch에서 가져온 synchSeq와 해당 synch의 테이블이름과 같은 테이블의 seq를 비교하여
    //서로 같은 값이 있다면 data로 할당한다.
    const data = await localConnection.execute(
      `SELECT * FROM ${tableNm} WHERE ${tableKey} = ${tableColumns[0][0].COLUMN_NAME}`
    );
    // dw_breeding에 regDate 가 0000-00-00 00:00:00 이 들어오면 invalid Date가 반환되서 미리 now()로 수정

    //data에 값이 있는지 검사후 실행하도록 한다.
    //data에 있는 컬럼들의 값들을 valueString에 넣어주되 타입에 맞게 value를 수정해준다
    try {
      let valuesString = await getValuesString(columnNames, columnTypes, data);

      //procedure에 넣을 value(매개변수)들의 순서맞춤.
      if (tableNm === 'dw_feed_move_robot') {
        valuesString = await spClDwFeedMoverRobot(valuesString);
        procedureName = 'sp_cl_feed_move';
      }
      //매개변수들을 string으로 변환 후 프로시져를 호출한다.
      let joinedValuesString = valuesString.join(', ');
      await connection.execute(`CALL ${procedureName}(${joinedValuesString})`);
    } catch (error) {
      console.log('error', error, tableNm);
    }
  };

  // where tableNm = "dw_device_config"
  const inputData = async () => {
    setTimeout(async () => {
      let loop = true;
      while (loop) {
        const dw_3974Connection = await connectToMysql({
          host: 'localhost',
          user: 'root',
          password: '',
          database: '',
        });
        const dx_9999Connection = await connectToMysql({
          host: 'localhost',
          user: 'root',
          password: '',
          database: '',
        });
        //1 synch에서 데이터를 가져온다.
        const [synchRows] = await localConnection.execute(
          'SELECT * FROM dw_synch LIMIT 100'
        );

        console.log('synchRows.length', synchRows.length);

        //더이상 싱크에 값이 없으면 정지된다.
        if (synchRows.length === 0) {
          console.log('모든 작업을 마쳤습니다.');
          loop = false;
        } else {
          for (let item of synchRows) {
            //여기서 함수가 실행이 되어야된다.(table 이름에 따른 함수)
            //DX 서버에 넣어주는 함수
            await callProcedureDX(
              item.tableNm,
              item.tableKey1,
              dx_9999Connection
            );

            //DW 서버에 넣어주는 함수
            await callProcedureDW(
              item.tableNm,
              item.tableKey1,
              dw_3974Connection
            );

            // Synch를 각 db에 넣은 후 해당 데이터 삭제
            await localConnection.execute(
              `DELETE FROM dw_synch where synchSeq = ${item.synchSeq}`
            );
            // 가져온 데이터를 Synch_Backup에 추가
            await localConnection.execute(
              `INSERT INTO dw_synch_backup values(${item.synchSeq},'${
                item.tableNm
              }','${item.tableKey1}','${item.tableKey2}',now(),'${
                item.applyFlag
              }',${reFormDate(item.applyDate)},'${item.checkFlag}',${reFormDate(
                item.checkDate
              )})`
            );
          }
        }
        await dw_3974Connection.end();
        await dx_9999Connection.end();
      }
    }, 1);
  };
  inputData();
};

Main();

schedule.scheduleJob('0 12 * * *', async () => {
  Main();
});
// (async () => {
//   while (true) {
//     //1 synch에서 데이터를 가져온다.
//     const [synchRows] = await localConnection.execute(
//       'SELECT * FROM dw_synch LIMIT 1'
//     );
//     console.log('synchRows.length', synchRows.length);

//     for (let item of synchRows) {
//       //여기서 함수가 실행이 되어야된다.(table 이름에 따른 함수)
//       //DX 서버에 넣어주는 함수
//       await callProcedureDX(item.tableNm, item.tableKey1);
//       //DW 서버에 넣어주는 함수
//       await callProcedureDW(item.tableNm, item.tableKey1);

//       //Synch를 각 db에 넣은 후 해당 데이터 삭제
//       // await localConnection.execute(
//       //   `DELETE FROM dw_synch where synchSeq = ${item.synchSeq}`
//       // );
//       //가져온 데이터를 Synch_Backup에 추가
//       // await localConnection.execute(
//       //   `INSERT INTO dw_synch_backup values(${item.synchSeq},'${item.tableNm}','${item.tableKey1}','${item.tableKey2}',now(),'${item.applyFlag}',${item.applyDate},'${item.checkFlag}',${item.checkDate})`
//       // );
//     }
//     //이 조건문은 잘못되었다. 계속 돌아가기 때문에 후에 추가된 값들로 이뤄져 값이 적을 때가 있을텐데 그때마다 중단이 되버린다.
//     if (synchRows.length < 100) {
//       console.log('모든 작업을 마쳤습니다.');
//       break;
//     }
//   }
// })()
