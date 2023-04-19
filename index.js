const mysql = require('mysql2/promise');
const moment = require('moment-timezone');
const { filter } = require('jszip');

const dbOriginData = [
  { table: 'dw_animals', key: 'aniSeq', newTable: 'new_dw_animals' },
  { talbe: 'dw_animalsx', key: 'aniSeq', newTable: 'new_dw_animalsx' },
  {
    table: 'dw_animals_extra',
    key: 'aniSeq',
    newTable: 'new_dw_animals_extra',
  },
  { table: 'dw_biu', key: 'biuSeq', newTable: 'new_biu_table' },
  { table: 'dw_breeding', key: 'breedSeq', newTable: 'new_dw_breeding' },
  { table: 'dw_common_cd', key: 'commonSeq', newTable: 'new_dw_common_cd' },
  // {table:'dw_common_data',key:'groupCd',newTable:'new_dw_common_data'}, //seq없음 cd인데 데이터가 A001, B001, C001 같은 형식
  { table: 'dw_config', key: 'devSeq', newTable: 'new_dw_config' },
  { talbe: 'dw_daily_feed', key: 'feedSeq', newTable: 'new_dw_daily_feed' },
  {
    table: 'dw_daily_feed_backup',
    key: 'feedSeq',
    newTable: 'new_dw_daily_feed_backup',
  },
  {
    table: 'dw_daily_feed_extra',
    key: 'feedExtraSeq',
    newTable: 'new_dw_daily_feed_extra',
  },
  {
    table: 'dw_daily_feed_robot',
    key: 'feedSeq',
    newTable: 'new_dw_daily_feed_robot',
  },
  {
    table: 'dw_daily_feed_robot_backup',
    key: 'feedSeq',
    newTable: 'new_dw_feed_robot_backup',
  },
  {
    table: 'dw_device_alert',
    key: 'alertSeq',
    newTable: 'new_dw_device_alert',
  },
  {
    table: 'dw_device_config',
    key: 'devSeq',
    newTable: 'new_dw_device_config',
  },
  { talbe: 'dw_environments', key: 'RMMId', newTable: 'new_dw_environments' },
  {
    table: 'dw_environments_log',
    key: 'RMMIdLog',
    newTable: 'new_environments_log',
  },
  { table: 'dw_event', key: 'EventSeq', newTable: 'new_dw_event' },
  { table: 'dw_family_tree', key: 'famSeq', newTable: 'new_dw_family_tree' },
  { table: 'dw_farm_alert', key: 'alertSeq', newTable: 'new_dw_farm_alert' },
  { table: 'dw_feed_move', key: 'moveSeq', newTable: 'new_dw_feed_move' },
  {
    table: 'dw_feed_move_backup',
    key: 'moveSeq',
    newTable: 'mew_dw_feed_move_backup',
  },
  {
    table: 'dw_feed_move_extra',
    key: 'moveExtraSeq',
    newTable: 'new_dw_feed_move_extra',
  },
  {
    table: 'dw_feed_move_robot',
    key: 'moveSeq',
    newTable: 'new_dw_feed_move_robot',
  },
  {
    table: 'dw_feed_move_robot_backup',
    key: 'moveSeq',
    newTable: 'new_dw_feed_move_robot_backup',
  },
  { table: 'dw_heat', key: 'heatSeq', newTable: 'new_dw_heat' },
  { table: 'dw_history', key: 'hid', newTable: 'new_dw_history' },
  { table: 'dw_indoor', key: 'indId', newTable: 'new_dw_indoor' },
  { table: 'dw_localsettings', key: 'Id', newTable: 'new_dw_localsettings' },
  { table: 'dw_manager', key: 'manSeq', newTable: 'new_dw_manager' },
  { table: 'dw_milkdaily', key: 'MilkDailySeq', newTable: 'new_dw_milkdaily' },
  { table: 'dw_milkend', key: 'MilkendSeq', newTable: 'new_dw_milkend' },
  { table: 'dw_milking', key: 'milkSeq', newTable: 'new_dw_milking' },
  {
    table: 'dw_milkingsets',
    key: 'milkingSeq',
    newTable: 'new_dw_milkingsets',
  },
  {
    table: 'dw_milking_config',
    key: 'confSeq',
    newTable: 'new_dw_milking_config',
  },
  {
    table: 'dw_milking_config_log',
    key: 'confLogSeq',
    newTable: 'new_dw_milking_config_log',
  },
  {
    table: 'dw_milking_daily',
    key: 'dailySeq',
    newTable: 'new_dw_milking_daily',
  },
  {
    table: 'dw_milking_daily_div',
    key: 'dailyDivSeq',
    newTable: 'new_dw_milking_daily_div',
  },
  { table: 'dw_milking_div', key: 'divSeq', newTable: 'new_dw_milking_div' },
  { table: 'dw_milking_do', key: 'doSeq', newTable: 'new_dw_milking_do' },
  {
    table: 'dw_milking_do_div',
    key: 'divSeq',
    newTable: 'new_dw_milking_do_div',
  },
  {
    table: 'dw_milking_do_extra',
    key: 'doExSeq',
    newTable: 'new_dw_milking_do_extra',
  },
  {
    table: 'dw_milking_do_info',
    key: 'milkDoSeq',
    newTable: 'new_dw_milking_do_info',
  },
  { table: 'dw_milking_feed', key: 'moveSeq', newTable: 'new_dw_milking_feed' },
  { table: 'dw_milking_memo', key: 'memoSeq', newTable: 'new_dw_milking_memo' },
  {
    table: 'dw_milking_report1',
    key: 'seq',
    newTable: 'new_dw_milking_report1',
  },
  {
    table: 'dw_milking_report2',
    key: 'seq',
    newTable: 'new_dw_milking_report2',
  },
  {
    table: 'dw_milking_report3',
    key: 'seq',
    newTable: 'new_dw_milking_report3',
  },
  {
    table: 'dw_milking_report4',
    key: 'seq',
    newTable: 'new_dw_milking_report4',
  },
  {
    table: 'dw_milking_report5',
    key: 'seq',
    newTable: 'new_dw_milking_report5',
  },
  {
    table: 'dw_milking_report6',
    key: 'seq',
    newTable: 'new_dw_milking_report6',
  },
  {
    table: 'dw_milking_report8',
    key: 'seq',
    newTable: 'new_dw_milking_report8',
  },
  {
    table: 'dw_milking_report9',
    key: 'seq',
    newTable: 'new_dw_milking_report9',
  },
  {
    table: 'dw_milking_report_all',
    key: 'seq',
    newTable: 'new_dw_milking_report_all',
  },
  {
    table: 'dw_milking_report_all_backup',
    key: 'seq',
    newTable: 'new_dw_milking_report_all_backup',
  },
  {
    table: 'dw_milking_report_all_x1',
    key: 'seq',
    newTable: 'new_dw_milking_report_all_x1',
  },
  {
    table: 'dw_milking_report_all__',
    key: 'seq',
    newTable: 'new_dw_milking_report_all__',
  },
  {
    table: 'dw_milking_report_all__daily',
    key: 'seq',
    newTable: 'new_dw_milking_report_all__daily',
  },
  {
    table: 'dw_milking_report_all__daily',
    key: 'seq',
    newTable: 'new_dw_milking_report_all__daily',
  },
  { table: 'dw_mqttsave', key: 'Id', newTable: 'new_dw_mqttsave' },
  { table: 'dw_rumination', key: 'ruSeq', newTable: 'new_dw_rumination' },
  { table: 'dw_smslog', key: 'smsSeq', newTable: 'new_dw_smslog' },
  { table: 'dw_synch', key: 'synchSeq', newTable: 'new_dw_synch' },
  {
    table: 'dw_synch_backup',
    key: 'synchSeq',
    newTable: 'new_dw_synch_backup',
  },
  { table: 'dw_synch_mssql', key: 'synchSeq', newTable: 'new_dw_synch_mssql' },
  {
    table: 'dw_synch_mssql_backup',
    key: 'synchSeq',
    newTable: 'new_dw_synch_mssql_backup',
  },
  { table: 'dw_user', key: 'userID', newTable: 'new_dw_user' },
  { table: 'dw_water', key: 'waterSeq', newTable: 'new_dw_water' },
  { table: 'employees', key: 'id', newTable: 'new_employees' },
  { table: 'log_animals', key: 'aniLogSeq', newTable: 'new_log_animals' },
  { table: 'tblheatresult', key: 'aniSeq', newTable: 'new_tblheatresult' },
  {
    table: 'tbl_ani_inout_date',
    key: 'idx',
    newTable: 'new_tbl_ani_inout_date',
  },
];

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
  const getColumnNames = (columns) =>
    columns.map((column) => column.COLUMN_NAME);

  //synch 데이터를 가져옵니다.
  const [synchRows] = await localConnection.execute(
    'SELECT * FROM dw_synch LIMIT 10'
  );
  let filteredData;
  let dataInfo = [];
  (async () => {
    for (let item of dbOriginData) {
      filteredData = synchRows.filter((x) => item.table === x.tableNm);
      //table name이 같으닊 ㅏ이제 db에서 테이블 name이 같은 것들중에 key값이 같은게 있는지 체크해야함.

      if (filteredData.length > 0) {
        //         //filteredData에 값들이 많으니 반복문을 돌려서 tableKey1과 item.key가 같은 것들을 배열로 뽑아내야한다.
        let instantArr = [];
        for (const data of filteredData) {
          const result = await localConnection.execute(
            `SELECT * FROM ${item.table} WHERE ${item.key} = ${Number(
              data.tableKey1
            )}`
          );
          instantArr.push(result[0]);
        }
        dataInfo = [...instantArr];
        //이제 dataInfo만큼 돌려서 값을 넣어주면 된다.
        // console.log('dataInfo', dataInfo[0]);
        for (const data of dataInfo) {
          console.log('item', item.table);
          let result;
          const tableColumns = await schemaConnection.execute(
            `SELECT COLUMN_NAME FROM COLUMNS WHERE TABLE_NAME='${item.table}' and table_schema='dawoon' ORDER BY ordinal_position ASC;`
          );
          const columnNames = await getColumnNames(tableColumns[0]);
          const columnNamesString = await columnNames.join(',');
          const valuesString = await Promise.all(
            columnNames.map(async (name) => {
              console.log('data', data);
              const value = data[0][name];
              if (typeof value === 'string') {
                return `'${value}'`;
              } else if (value instanceof Date) {
                return `'${value.toISOString().slice(0, 19).replace('T', '')}'`;
              } else {
                return value;
              }
            })
          );
          console.log('valuesString', valuesString);
          const joinedValuesString = valuesString.join(', ');
          console.log('joinedValuesString', joinedValuesString);
          await dx_9999Connection.execute(
            `REPLACE INTO ${item.table}(${columnNamesString}) VALUES(${joinedValuesString})`
          );
        }
      }
    }
  })();
};

Main();

// const Main = async () => {
//   const localConnection = await connectToMysql({
//     host: 'localhost',
//     user: 'root',
//     password: 'ekdnsel',
//     database: 'dawoon',
//   });
//   const dx_9999Connection = await connectToMysql({
//     host: 'localhost',
//     user: 'root',
//     password: 'ekdnsel',
//     database: 'dx_9999',
//   });
//   const schemaConnection = await connectToMysql({
//     host: 'localhost',
//     user: 'root',
//     password: 'ekdnsel',
//     database: 'information_schema',
//   });
//   const getColumnNames = (columns, dataInfo) =>
//     columns.map((column) => column.COLUMN_NAME);

//   //synch 데이터를 가져옵니다.
//   const [synchRows] = await localConnection.execute(
//     'SELECT * FROM dw_synch LIMIT 100'
//   );
//   let filteredData;
//   let dataInfo = [];
//   (async () => {
//     for (let item of dbOriginData) {
//       filteredData = synchRows.filter((x) => item.table === x.tableNm);
//       //table name이 같으닊 ㅏ이제 db에서 테이블 name이 같은 것들중에 key값이 같은게 있는지 체크해야함.

//       if (filteredData.length > 0) {
//         //filteredData에 값들이 많으니 반복문을 돌려서 tableKey1과 item.key가 같은 것들을 배열로 뽑아내야한다.
//         let instantArr = [];
//         for (const data of filteredData) {
//           const result = await localConnection.execute(
//             `SELECT * FROM ${item.table} WHERE ${item.key} = ${Number(
//               data.tableKey1
//             )}`
//           );
//           instantArr.push(...result);
//         }
//         dataInfo = [...instantArr];
//         //이제 dataInfo만큼 돌려서 값을 넣어주면 된다.
//         // console.log('dataInfo', dataInfo[0]);

//         for (const data of dataInfo) {
//           let result;
//           let tableColumns = await schemaConnection.execute(
//             `SELECT COLUMN_NAME FROM COLUMNS WHERE TABLE_NAME='${item.table}' and table_schema='dawoon' ORDER BY ordinal_position ASC;`
//           );
//           console.log('data', data[0]);
//           const columnNames = await getColumnNames(tableColumns[0], data[0]);
//           const columnNamesString = await columnNames.join(', ');
//           console.log('columnNames', columnNames);
//           const valuesString = await Promise.all(
//             columnNames.map(async (name) => {
//               const value = data[0][name];
//               if (typeof value === 'string') {
//                 return `'${value}'`;
//               } else if (value instanceof Date) {
//                 return `'${value
//                   .toISOString()
//                   .slice(0, 19)
//                   .replace('T', ' ')}'`;
//               } else {
//                 return value;
//               }
//             })
//           );
//           const joinedValuesString = valuesString.join(', ');
//           console.log('valueString', valuesString);
//           await dx_9999Connection.execute(
//             `REPLACE INTO ${item.table}(${columnNamesString}) VALUES(${joinedValuesString})`
//           );
//         }

//       }
//     }
//   })();
// dataInfo = await localConnection.execute(
//   `SELECT * FROM ${item.table} WHERE ${item.key} = ${Number(
//     filteredData[0].tableKey1
//   )}`

//   //여기서 이제 컬럼을 뽑아내서 그 컬럼들에 맞는 값을 넣어주는 것이겠지?
// );
// let tableColumns = await schemaConnection.execute(
//   `SELECT COLUMN_NAME FROM COLUMNS WHERE TABLE_NAME='${item.table}' and table_schema='dawoon' ORDER BY ordinal_position ASC;`
// );
// const columnNames = getColumnNames(tableColumns[0], dataInfo[0][0]);

// const columnNamesString = columnNames.join(', ');
// const valuesString = columnNames
//   .map((name) => {
//     const value = dataInfo[0][0][name];
//     if (typeof value === 'string') {
//       return `'${value}'`;
//     } else if (value instanceof Date) {
//       return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
//     } else {
//       return value;
//     }
//   })
//   .join(', ');

// await dx_9999Connection.execute(
//   `INSERT INTO ${item.table} (${columnNamesString}) VALUES (${valuesString})`
// );

// let promises = synchRows.map(async (item) => {
//   try {
//     let getTableData = await localConnection.execute(
//       `SELECT moveSeq FROM ${item.tableNm} LIMIT 10`
//     );
//     // await dx_9999Connection.execute(
//     //   `INSERT INTO dw_synch_backup (synchSeq, tableNm, tableKey1, tableKey2, issueDate, applyFlag, applyDate, checkFlag, checkDate) VALUES (${item.synchSeq}, '${item.tableNm}', ${item.tableKey1}, 1, NOW(), '${item.applyFlag}', ${item.applyDate}, '${item.checkFlag}', ${item.checkDate})`
//     // );
//   } catch (err) {
//     // await dx_9999Connection.execute(
//     //   `INSERT INTO dw_synch_backup (synchSeq, tableNm, tableKey1, tableKey2, issueDate, applyFlag, applyDate, checkFlag, checkDate) VALUES (${item.synchSeq}, '${item.tableNm}', ${item.tableKey1}, 1, NOW(), '${item.applyFlag}', ${item.applyDate}, '${item.checkFlag}', ${item.checkDate})`
//     // );
//   }
//   let data = await Promise.all(promises);

// const [result] = await dx_9999Connection.execute('CALL sp_animal(?)',[synchRows])
// });

//   카이트 서버에 연결
// console.log('rows', synchRows);
// const kiteDwConnection = await connectToMysql({
//   host: '',
// });
// const kiteDxConnection = await connectToMysql({
//   host: '',
// });
// };
// Main();
