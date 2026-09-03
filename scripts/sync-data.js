const fs=require("fs");
const path=require("path");

const LOCAL=path.join(__dirname,"..","data","xsmn_seed.json");
const STATUS=path.join(__dirname,"..","data","update-status.json");
const SOURCE="https://raw.githubusercontent.com/Thienlee86/du-bao-xsmn/main/data/xsmn_seed.json";
const SCHEMA={db:[1,6],g1:[1,5],g2:[1,5],g3:[2,5],g4:[7,5],g5:[1,4],g6:[3,4],g7:[1,3],g8:[1,2]};

const values=x=>Array.isArray(x)?x:[x];
function normalized(draw){
  const out={province:String(draw?.province||""),date:String(draw?.date||""),ticketCode:String(draw?.ticketCode||""),prizes:{}};
  if(!out.province||!/^\d{4}-\d{2}-\d{2}$/.test(out.date))throw new Error("Bản ghi thiếu tỉnh/ngày hợp lệ");
  for(const [key,[count,digits]] of Object.entries(SCHEMA)){
    const list=values(draw?.prizes?.[key]).map(x=>String(x??"").trim().padStart(digits,"0"));
    if(list.length!==count||list.some(x=>!new RegExp("^\\d{"+digits+"}$").test(x)))throw new Error(out.province+" "+out.date+": sai cấu trúc "+key);
    out.prizes[key]=count===1?list[0]:list;
  }
  return out;
}
function canonical(draw){return JSON.stringify(normalized(draw).prizes)}
function validate(payload){
  if(!payload||!Array.isArray(payload.draws))throw new Error("Nguồn không có mảng draws");
  const draws=payload.draws.map(normalized),seen=new Set(),counts=new Map();
  for(const draw of draws){
    const key=draw.province+"|"+draw.date;
    if(seen.has(key))throw new Error("Trùng kỳ "+key);
    seen.add(key);counts.set(draw.province,(counts.get(draw.province)||0)+1);
  }
  if(counts.size!==21)throw new Error("Cần đủ 21 tỉnh, nhận "+counts.size);
  for(const [province,count] of counts)if(count!==100)throw new Error(province+": cần 100 kỳ, nhận "+count);
  if(draws.length!==2100)throw new Error("Cần 2100 kỳ, nhận "+draws.length);
  const tomorrow=new Date();tomorrow.setUTCDate(tomorrow.getUTCDate()+1);
  const maxAllowed=tomorrow.toISOString().slice(0,10);
  if(draws.some(x=>x.date>maxAllowed))throw new Error("Nguồn chứa ngày ở tương lai");
  return draws;
}
function latestByProvince(draws){
  const result={};
  for(const d of draws)if(!result[d.province]||d.date>result[d.province])result[d.province]=d.date;
  return result;
}
async function main(){
  const oldPayload=JSON.parse(fs.readFileSync(LOCAL,"utf8")),oldDraws=validate(oldPayload);
  const response=await fetch(SOURCE,{headers:{"User-Agent":"xskt-forecast-lab-data-sync"},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error("Nguồn trả HTTP "+response.status);
  const candidatePayload=await response.json(),newDraws=validate(candidatePayload);
  const oldMap=new Map(oldDraws.map(x=>[x.province+"|"+x.date,x]));
  for(const draw of newDraws){
    const previous=oldMap.get(draw.province+"|"+draw.date);
    if(previous&&canonical(previous)!==canonical(draw))throw new Error("Nguồn đã sửa lịch sử "+draw.province+" "+draw.date);
  }
  const before=latestByProvince(oldDraws),after=latestByProvince(newDraws);
  for(const province of Object.keys(before))if(!after[province]||after[province]<before[province])throw new Error("Dữ liệu lùi ngày tại "+province);
  const additions=newDraws.filter(x=>!oldMap.has(x.province+"|"+x.date)).length;
  const changed=JSON.stringify(oldDraws)!==JSON.stringify(newDraws);
  if(changed)fs.writeFileSync(LOCAL,JSON.stringify({generatedAt:candidatePayload.generatedAt||new Date().toISOString().slice(0,10),source:candidatePayload.source||SOURCE,draws:newDraws},null,2)+"\n");
  fs.writeFileSync(STATUS,JSON.stringify({checkedAt:new Date().toISOString(),source:SOURCE,status:changed?"updated":"current",added:additions,total:newDraws.length,provinces:21,latestDate:Object.values(after).sort().at(-1)},null,2)+"\n");
  console.log(changed?"Đã cập nhật "+additions+" kỳ mới.":"Dữ liệu đã là bản mới nhất.");
}
main().catch(error=>{console.error(error);process.exit(1)});