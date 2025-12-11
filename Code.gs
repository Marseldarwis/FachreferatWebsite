function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = data[0];
  var rows = data.slice(1);
  
  var result = rows.map(function(row) {
    var obj = {};
    headers.forEach(function(header, index) {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = e.postData.contents;
    var jsonData = JSON.parse(rawData);
    
    // Check for Reset Action
    if (jsonData.action === 'reset') {
      sheet.clear();
      // Restore headers if needed, or let next post recreate them.
      // Better to keep headers or define them explicitly.
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data cleared' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Normal Submission
    var headers = [];
    if (sheet.getLastRow() > 0) {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }
    
    // Check if we need to add new headers for new keys
    var newKeys = Object.keys(jsonData);
    newKeys.forEach(function(key) {
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        sheet.getRange(1, headers.length).setValue(key);
      }
    });
    
    // Map data to headers
    var row = headers.map(function(header) {
      return jsonData[header] || '';
    });
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
