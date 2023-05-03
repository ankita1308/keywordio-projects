// github link :- https://github.com/ashishpathak30/ankitaSingh/blob/master/googleAdsScript/pmaxAnalysis.js.js
// Ads script link : - https://ads.google.com/aw/bulk/scripts/edit?ocid=95841753&ascid=95841753&scriptId=6281970&euid=617132319&__u=3580633831&uscid=95841753&__c=4290313297&authuser=0&subid=in-en-ha-awa-bk-c-c00%21o3~Cj0KCQjwn4qWBhCvARIsAFNAMih7npWsAmBnfE6bb2BJqD7vYB-Weqo3EQO9S0b4bdRI_tenjjC1noIaAszyEALw_wcB~140706620052~kwd-94527731~16862088904~592470418766
function main() {
    var spreadsheet = SpreadsheetApp.openByUrl(
      'https://docs.google.com/spreadsheets/d/1Ojf_L8H4FosQ7x50yGetRSNimrCcUgtK8z06v1ZvYC4/edit#gid='
    ); 
    
    var sheet = spreadsheet.getSheetByName('Sheet1');
  
    var data = sheet.getSheetValues(2, 1,-1,-1);
    
    data.forEach(function(row) {
      var customer_ids = row[1].split(',');
      var spreadsheet_link = row[2];
      Logger.log(typeof(customer_ids));
      Logger.log(typeof(spreadsheet_link));
      
      if (customer_ids != ''){
        
          var e = SpreadsheetApp.openByUrl(spreadsheet_link);
          
          let t=e.getSheetByName("r_c"),s=e.getSheetByName("r_ca"),a=e.getSheetByName("r_a"),i=e.getSheetByName("r_ag");t.getRange("A2:K").clearContent(),s.getRange("A2:I").clearContent(),a.getRange("A2:K").clearContent(),i.getRange("A2:H").clearContent();let n=AdsManagerApp.accounts().withIds(customer_ids).get();for(;n.hasNext();){AdsManagerApp.select(n.next());let c=AdsApp.currentAccount().getCustomerId(),r=c;try{r=AdsApp.currentAccount().getName()}catch(g){}let o=[],m=AdsApp.search(`
          SELECT 
          
          campaign.name, 
          campaign.id, 
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.video_views, 
          metrics.average_cpv
          
          FROM campaign
          WHERE segments.date DURING LAST_30_DAYS
          AND campaign.advertising_channel_type = "PERFORMANCE_MAX" 
          AND metrics.cost_micros > 0
          ORDER BY campaign.id
          `),u=[];for(;m.hasNext();){let l=m.next(),{resourceName:p,name:h,id:R}=l.campaign,{costMicros:d,impressions:A,clicks:N,conversions:E,conversionsValue:v,videoViews:y,averageCpv:D}=l.metrics;o.push(R),u.push([r,c,h,R,d/1e6,A,N,E,v,y,D/1e6])}if(u.length>0&&t.getRange(t.getLastRow()+1,1,u.length,u[0].length).setValues(u),0===u.length)continue;let S=AdsApp.search(`
          SELECT 
          campaign.name,
          campaign.id, 
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          segments.asset_interaction_target.asset, 
          segments.asset_interaction_target.interaction_on_this_asset
          
          FROM campaign
          WHERE segments.date DURING LAST_30_DAYS
          AND campaign.advertising_channel_type = "PERFORMANCE_MAX" 
          AND segments.asset_interaction_target.interaction_on_this_asset != "TRUE"
          AND metrics.cost_micros > 0
          ORDER BY campaign.id
          `),$=[];for(;S.hasNext();){let f=S.next(),{name:x,id:I}=f.campaign,{assetInteractionTarget:{asset:_}}=f.segments,{costMicros:C,impressions:L,clicks:O,conversions:T,conversionsValue:V}=f.metrics;$.push([r,x,I,_,C/1e6,L,O,T,V])}$.length>0&&s.getRange(s.getLastRow()+1,1,$.length,$[0].length).setValues($);let b=AdsApp.search(`
          SELECT 
          campaign.name, 
          campaign.id, 
          asset_group.id, 
          asset_group.name, 
          asset_group.status, 
          asset_group_listing_group_filter.type, 
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value
          
          FROM asset_group_product_group_view 
          WHERE segments.date DURING LAST_30_DAYS 
          AND asset_group_listing_group_filter.type != "SUBDIVISION" 
          AND campaign.id IN ('${o.join("','")}')
          AND metrics.cost_micros > 0
          ORDER BY campaign.id
          `),B=[];for(;b.hasNext();){let M=b.next(),{name:w,id:F,status:U}=M.assetGroup,{costMicros:Y,impressions:G,clicks:H,conversions:W,conversionsValue:k}=M.metrics;B.push([r,M.campaign.name,M.campaign.id,w,F,U,Y/1e6,G,H,W,k])}B.length>0&&a.getRange(a.getLastRow()+1,1,B.length,B[0].length).setValues(B);let j=AdsApp.search(`
          SELECT 
          campaign.name, 
          campaign.id, 
          asset_group.id, 
          asset_group.name, 
          asset.resource_name,
          asset_group_asset.field_type,
          asset.source,
          asset.name,
          asset.text_asset.text,
          asset.image_asset.full_size.url,
          asset.youtube_video_asset.youtube_video_title,
          asset.youtube_video_asset.youtube_video_id
          
          FROM asset_group_asset 
          WHERE campaign.id IN ('${o.join("','")}')
          `),z=[];for(;j.hasNext();){let K=j.next(),P="",X="",q="";K.asset.imageAsset&&(P=K.asset.imageAsset.fullSize.url),K.asset.youtubeVideoAsset&&(X=K.asset.youtubeVideoAsset.youtubeVideoId,q=K.asset.youtubeVideoAsset.youtubeVideoTitle);let{resourceName:J,source:Q,name:Z}=K.asset,{fieldType:ee}=K.assetGroupAsset;z.push([r,J,ee,Q,P,X,q,Z])}z.length>0&&i.getRange(i.getLastRow()+1,1,z.length,z[0].length).setValues(z)}
        }
    });
}