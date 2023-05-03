// github link :- https://github.com/ashishpathak30/ankitaSingh/blob/master/googleAdsScript/pmaxAnalysis.js.js
// Ads script link : - https://ads.google.com/aw/bulk/scripts/edit?ocid=286581543&ascid=286581543&scriptId=6345546&euid=617132319&__u=3580633831&uscid=95841753&__c=4290313297&authuser=0&subid=in-en-ha-awa-bk-c-c00%21o3~Cj0KCQjwn4qWBhCvARIsAFNAMih7npWsAmBnfE6bb2BJqD7vYB-Weqo3EQO9S0b4bdRI_tenjjC1noIaAszyEALw_wcB~140706620052~kwd-94527731~16862088904~592470418766
// Developer Name :- Ankita Singh

// Install this script in your Google Ads account (not an MCC account)
// to generate a Google Sheet with a list of all your responsive search ads
// and their headlines and descriptions.
// For RSAs that are not using the maximum number of allowed variations,
// this script will suggest new variations for headlines and descriptions 
// using the OpenAI GPT API.
// The resulting sheet can be bulk uploaded back into Google Ads.
// --------------------------------
// For more PPC tools, visit www.optmyzr.com.
// *************************************************************************************************

// If Blank script will create a new Google sheet everytime it runs.
var SS_URL = 'https://docs.google.com/spreadsheets/d/1B3Dp4ECII0dd43V58Yp6qFHQvTF1F6SJnOPCOY8Bi2s/edit#gid=0'; 

// Name of the tab in the Google sheet.
var TAB_NAME = 'RSA';

// Flag to decide if the script checks only ads in active campaigns and active ad groups
var INCLUDE_PAUSED = false;

// only include ads with this many or fewer headlines on the output spreadsheet (defaults to 15)
var MAX_HEADLINES = 15;

// only include ads with this many or fewer descriptions on the output spreadsheet (defaults to 4)
var MAX_DESCRIPTIONS = 4;

// Multiple emails can be added sepearated by comma (,)
// Used for access to spreadsheet and for sending email
var EMAIL = 'ankita@keywordio.com';

// Set to true if you want to recieve the report on Email.
var SEND_EMAIL = true;

var OPEN_AI_API_KEY = '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'; // get your own API key at https://platform.openai.com/account/api-keys

var GPT_MODEL = 'gpt-3.5-turbo';

// Do not edit anything below this line
function main() {
  
  var output = [[
    'Account ID', 'Account Name', 'Campaign', 'Ad Group', 'Ad ID', '# Headlines', '# Descriptions', 'Ad Strength', 
    'Headline 1', 'Headline 2', 'Headline 3', 'Headline 4', 'Headline 5', 'Headline 6', 'Headline 7', 'Headline 8', 'Headline 9', 
    'Headline 10', 'Headline 11', 'Headline 12', 'Headline 13', 'Headline 14', 'Headline 15', 
    'Description Line 1', 'Description Line 2', 'Description Line 3', 'Description Line 4'
  ]];
  
  var columCount = output[0].length;
  var backgroupHeader = [];
  while(backgroupHeader.length < columCount) {
    backgroupHeader.push('#ffffff');
  }
  
  var backgrounds = [backgroupHeader];
  
  var accId = AdsApp.currentAccount().getCustomerId(),
      accName = AdsApp.currentAccount().getName();
  
  var query = [
    'SELECT campaign.name, ad_group.name, ad_group_ad.ad.id, ad_group_ad.ad_strength,',
    'ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions',
    'FROM ad_group_ad WHERE ad_group_ad.ad.type = RESPONSIVE_SEARCH_AD AND metrics.impressions >= 0',
    INCLUDE_PAUSED ? '' : 'AND ad_group_ad.status = ENABLED AND campaign.status = ENABLED and ad_group.status = ENABLED',
    'AND segments.date DURING LAST_7_DAYS'
  ].join(' ');
  
  var rows = AdsApp.report(query).rows();
  while(rows.hasNext()) {
    var row = rows.next();
    
    var headlines = row['ad_group_ad.ad.responsive_search_ad.headlines'];
    var headlineCount = headlines.length;
    
    var descriptions = row['ad_group_ad.ad.responsive_search_ad.descriptions'];
    var descriptionCount = descriptions.length;
    
    if(headlineCount > MAX_HEADLINES || descriptionCount > MAX_DESCRIPTIONS) { continue; }
    
    var out = [
      accId, accName, row['campaign.name'], row['ad_group.name'], row['ad_group_ad.ad.id'],
      headlineCount, descriptionCount, row['ad_group_ad.ad_strength']
    ];
    
    var bgRow = ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'];
    
    var headlinesText = [];
    for(var z in headlines) {
      headlinesText.push(headlines[z].text);
      bgRow.push('#ffffff');
    }
    
    var diff = 15 - headlinesText.length;
    
    var autoHeadlines = [];
    if(diff > 0) {
      autoHeadlines = generateTextOpenAI('Find '+diff+' more ad headlines under 30 characters that are similar to these:\n', headlinesText);
    }
    
    if(autoHeadlines.length) {
      headlinesText = headlinesText.concat(autoHeadlines);
      for(var i = 0; i < autoHeadlines.length; i++) {
        bgRow.push('#d9ead3');
      }
    }
    
    while(headlinesText.length < 15) {
      headlinesText.push('');
      bgRow.push('#fffff')
    }
    
    while(headlinesText.length > 15) {
      headlinesText.pop();
      bgRow.pop();
    }
    
    var descriptionsText = [];
    for(var z in descriptions) {
      descriptionsText.push(descriptions[z].text);
      bgRow.push('#ffffff');
    }
    
    var diff = 4 - descriptions.length;
    var autoDescriptions = [];
    if(diff > 0) {
      autoDescriptions = generateTextOpenAI('Find '+diff+' more ad descriptions under 90 characters that are similar to these:\n', descriptionsText);
    }
    
    if(autoDescriptions.length) {
      descriptionsText = descriptionsText.concat(autoDescriptions);
      for(var i = 0; i < autoDescriptions.length; i++) {
        bgRow.push('#d9ead3');
      }
    }
    
    while(descriptionsText.length < 4) {
      descriptionsText.push('');
      bgRow.push('#ffffff');
    }
    
    while(descriptionsText.length > 4) {
      descriptionsText.pop();
      bgRow.pop();
    }
    
    out = out.concat(headlinesText).concat(descriptionsText);
    
    backgrounds.push(bgRow);
    output.push(out);
  }
  
  if(!SS_URL) {
    var ss = SpreadsheetApp.create(accName + ': RSA Report');
    SS_URL = ss.getUrl(); 
    
    if(EMAIL) { 
      ss.addEditors(EMAIL.split(','));
    }
  }
  
  Logger.log('Report URL: ' + SS_URL);
  var ss = SpreadsheetApp.openByUrl(SS_URL);
  var tab = ss.getSheetByName(TAB_NAME);
  if(!tab) {
    tab = ss.getSheetByName('Sheet1');
    if(!tab) {
     tab = ss.insertSheet(TAB_NAME);
    } else {
     tab.setName(TAB_NAME) 
    }
  }
  
  tab.clearContents();
  tab.setFrozenRows(1);
  tab.getRange(1,1,output.length,output[0].length).setValues(output).setBackgrounds(backgrounds).setFontFamily('Calibri');
  
  if(EMAIL && SEND_EMAIL) {
    MailApp.sendEmail(EMAIL, accName + ' RSA Report is ready', 'Report is available at below link:\n'+SS_URL);
  }
}

function getGoogleAdsFormattedDate(d, format){
  var date = new Date();
  date.setDate(date.getDate() - d);
  return Utilities.formatDate(date,AdsApp.currentAccount().getTimeZone(),format);
}

function generateTextOpenAI(question, texts) {
  
  //texts.pop();
  var prompt = question + texts.join('\n');
  
  var messages= [
    {"role": "user", "content": prompt}
  ];
  
  var payload = {
    "model": GPT_MODEL,
    "messages": messages
  };
  
  var httpOptions = {
    "method" : "POST",
    "muteHttpExceptions": true,
    "contentType": "application/json",
    "headers" : {
      "Authorization" : 'Bearer ' + OPEN_AI_API_KEY  
    },
    'payload': JSON.stringify(payload)
  };
  
  //Logger.log(JSON.stringify(payload));
  var response = JSON.parse(UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', httpOptions));
  var choices = response['choices'];
  
  var texts = [];
  if(choices && choices[0] && choices[0]['message']) {
    var output = choices[0]['message']['content'].split('\n');
    for(var z in output) {
      if(!output[z].trim()) { continue; }
      var parts = output[z].split('. ');
      if(parts.length > 1) {
        parts.shift();
      }
      texts.push(parts.join('. '));
    }
  } else {
    //Logger.log('No results found!')
    Logger.log(response);
  }
  
  return texts;
}