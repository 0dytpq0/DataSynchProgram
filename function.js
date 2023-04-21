const getColumnType = (columns) => {
  let columnType = [];
  columnType = columns.filter(
    (column) =>
      column.DATA_TYPE !== 'varchar' && column.DATA_TYPE !== 'datetime'
  );
  columnType = columnType.map((column) => column.COLUMN_NAME);
  return columnType;
};

const getColumnNames = (columns, table) => {
  let filteredColumns;
  table !== 'dw_manager' &&
  table !== 'dw_milking_config' &&
  table !== 'dw_milking_feed' &&
  table !== 'dw_milking_memo' &&
  table !== 'dw_milking_report1' &&
  table !== 'dw_milking_report2' &&
  table !== 'dw_milking_report3' &&
  table !== 'dw_milking_report4' &&
  table !== 'dw_milking_report5' &&
  table !== 'dw_milking_report6' &&
  table !== 'dw_milking_report8' &&
  table !== 'dw_milking_report9'
    ? (filteredColumns = columns.filter(
        (column) =>
          column.COLUMN_NAME !== 'regDate' &&
          column.COLUMN_NAME !== 'issueDate' &&
          column.COLUMN_NAME !== 'feedSeq'
      ))
    : (filteredColumns = columns);
  if (table === 'dw_animals') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME !== 'buyCost' && column.COLUMN_NAME !== 'aniType'
    );
  }
  if (table === 'dw_feed_move') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME !== 'aniSeq' &&
        column.COLUMN_NAME !== 'stdTime' &&
        column.COLUMN_NAME !== 'feedCd'
    );
  }
  if (table === 'dw_feed_move_robot') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME !== 'aniSeq' &&
        column.COLUMN_NAME !== 'stdTime' &&
        column.COLUMN_NAME !== 'aniFeedSet1' &&
        column.COLUMN_NAME !== 'aniFeedSet2' &&
        column.COLUMN_NAME !== 'aniFeedSet3' &&
        column.COLUMN_NAME !== 'aniFeedSet4' &&
        column.COLUMN_NAME !== 'aniFeedSet5' &&
        column.COLUMN_NAME !== 'feedCd'
    );
  }
  if (table === 'dw_indoor') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME !== 'indld' &&
        column.COLUMN_NAME !== 'now' &&
        column.COLUMN_NAME !== 'updateFlag'
    );
  }
  if (table === 'dw_milking_daily') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME !== 'dailySeq' &&
        column.COLUMN_NAME !== 'yieldP' &&
        column.COLUMN_NAME !== 'yieldE' &&
        column.COLUMN_NAME !== 'fatE' &&
        column.COLUMN_NAME !== 'proteinE' &&
        column.COLUMN_NAME !== 'lactoseE'
    );
  }
  if (table === 'dw_milking_daily_div') {
    filteredColumns = filteredColumns.filter(
      (column) => column.COLUMN_NAME !== 'dailyDivSeq'
    );
  }
  if (table === 'dw_milking_div') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME === 'milkDoSeq' || column.COLUMN_NAME == 'issueID'
    );
  }
  if (table === 'dw_milking_do') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME !== 'doSeq' &&
        column.COLUMN_NAME !== 'yieldP' &&
        column.COLUMN_NAME !== 'MilkingTeat' &&
        column.COLUMN_NAME !== 'fatE' &&
        column.COLUMN_NAME !== 'lactoseE'
    );
  }
  if (table === 'dw_milking_do_div') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME === 'milkDoSeq' || column.COLUMN_NAME == 'issueID'
    );
  }
  if (table === 'dw_milking_do_extra') {
    filteredColumns = filteredColumns.filter(
      (column) => column.COLUMN_NAME !== 'doExSeq'
    );
  }
  if (table === 'dw_milking_do_info') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME !== 'milkDoSeq' &&
        column.COLUMN_NAME !== 'milkCellE' &&
        column.COLUMN_NAME !== 'weight' &&
        column.COLUMN_NAME !== 'sampleNo'
    );
  }
  if (table === 'dw_milking_report2') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME !== 'totalYieldDiv' &&
        column.COLUMN_NAME !== 'fatE' &&
        column.COLUMN_NAME !== 'fatv' &&
        column.COLUMN_NAME !== 'fatEv' &&
        column.COLUMN_NAME !== 'proteinE' &&
        column.COLUMN_NAME !== 'proteinv' &&
        column.COLUMN_NAME !== 'proteinEv' &&
        column.COLUMN_NAME !== 'lactoseE' &&
        column.COLUMN_NAME !== 'lactosev' &&
        column.COLUMN_NAME !== 'lactoseEv'
    );
  }
  if (table === 'dw_milking_report3') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME !== 'yield' &&
        column.COLUMN_NAME !== 'yield1' &&
        column.COLUMN_NAME !== 'yield2' &&
        column.COLUMN_NAME !== 'yield3' &&
        column.COLUMN_NAME !== 'yield4' &&
        column.COLUMN_NAME !== 'yieldDiv' &&
        column.COLUMN_NAME !== 'yieldDiv1' &&
        column.COLUMN_NAME !== 'yieldDiv2' &&
        column.COLUMN_NAME !== 'yieldDiv3' &&
        column.COLUMN_NAME !== 'yieldDiv4'
    );
  }
  if (table === 'dw_synch' || table === 'dw_synch_mssql') {
    filteredColumns = filteredColumns.filter(
      (column) =>
        column.COLUMN_NAME !== 'applyDate' && column.COLUMN_NAME !== 'checkData'
    );
  }
  if (table === 'dw_water') {
    filteredColumns = filteredColumns.filter(
      (column) => column.COLUMN_NAME !== 'waterSeq'
    );
  }
  filteredColumns = filteredColumns.map((column) => column.COLUMN_NAME);
  return filteredColumns;
};

module.exports = { getColumnType, getColumnNames };
