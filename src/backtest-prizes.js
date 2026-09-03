import{predictOtherPrizes,predictOtherPrizesChallenger,PRIZE_TIERS}from"./model-prizes.js?v=3";
const wait=()=>new Promise(r=>setTimeout(r,0));
function bestPosition(number,actual){let best=0;for(const a of actual){let hit=0;for(let i=0;i<number.length;i++)if(number[i]===a[i])hit++;best=Math.max(best,hit)}return best}
function choose(n,k){let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return v}
function binomialCdf(k,n,p=.1){let sum=0;for(let i=0;i<=k;i++)sum+=choose(n,i)*(p**i)*((1-p)**(n-i));return sum}
function randomBestPosition(digits,count){let expected=0;for(let k=1;k<=digits;k++)expected+=1-(binomialCdf(k-1,digits)**count);return expected/digits}
function wilson(hits,n,z=1.96){const p=hits/n,z2=z*z,den=1+z2/n,center=(p+z2/(2*n))/den,margin=z*Math.sqrt((p*(1-p)+z2/(4*n))/n)/den;return{low:Math.max(0,center-margin),high:Math.min(1,center+margin)}}
function signal(hits,n,baseline){const interval=wilson(hits,n),status=interval.low>baseline?"Tốt":interval.high<baseline?"Kém":"Trung tính";return{status,confidenceLow:interval.low,confidenceHigh:interval.high}}
export async function backtestOtherPrizes(draws,{testSize=30,window=50,onProgress}={}){
 if(!Array.isArray(draws)||draws.length<20)throw new Error("Cần ít nhất 20 kỳ để kiểm định 8 giải");
 const requestedTrials=Math.max(10,+testSize||30),minimumTraining=10,trials=Math.min(requestedTrials,draws.length-minimumTraining),start=draws.length-trials;
 const stats=Object.fromEntries(PRIZE_TIERS.map(t=>[t.key,{...t,trials:0,exact:0,positions:0,tail2:0,randomExact:0,randomPositions:0,randomTail2:0}]));
 for(let i=start;i<draws.length;i++){const result=predictOtherPrizes(draws.slice(0,i),{window}),actual=draws[i];for(const p of result.tiers){const values=actual.prizes[p.key]||[],s=stats[p.key];s.trials++;if(values.includes(p.representative))s.exact++;s.positions+=bestPosition(p.representative,values)/p.digits;s.randomPositions+=randomBestPosition(p.digits,values.length);const tails=new Set(values.map(x=>x.slice(-2)));if(tails.has(p.representative.slice(-2)))s.tail2++;s.randomExact+=new Set(values).size/(10**p.digits);s.randomTail2+=tails.size/100}onProgress?.(i-start+1,trials);if((i-start)%2===1)await wait()}
 return{requestedTrials,trials,minimumTraining,window,rows:PRIZE_TIERS.map(t=>{const s=stats[t.key],tail2Rate=s.tail2/s.trials,randomTail2Rate=s.randomTail2/s.trials;return{key:t.key,label:t.label,digits:t.digits,trials:s.trials,exactRate:s.exact/s.trials,randomExactRate:s.randomExact/s.trials,positionAccuracy:s.positions/s.trials,randomPositionAccuracy:s.randomPositions/s.trials,tail2Rate,randomTail2Rate,...signal(s.tail2,s.trials,randomTail2Rate)}})};
}

function emptyComparison(){return{exact:0,tail2:0,positions:0,total:0}}
function addComparison(s,result,actual){for(const p of result.tiers){const values=actual.prizes[p.key]||[];s.total++;if(values.includes(p.representative))s.exact++;if(new Set(values.map(x=>x.slice(-2))).has(p.representative.slice(-2)))s.tail2++;s.positions+=bestPosition(p.representative,values)/p.digits}}
function finishComparison(s){return{exactRate:s.exact/s.total,tail2Rate:s.tail2/s.total,positionAccuracy:s.positions/s.total,total:s.total}}
export async function backtestChampionChallenger(draws,{testSize=50,window=50,onProgress}={}){
 if(!Array.isArray(draws)||draws.length<20)throw new Error("Cần ít nhất 20 kỳ để so sánh mô hình");
 const requestedTrials=Math.max(20,+testSize||50),minimumTraining=10,trials=Math.min(requestedTrials,draws.length-minimumTraining),start=draws.length-trials,champion=emptyComparison(),challenger=emptyComparison();
 for(let i=start;i<draws.length;i++){const history=draws.slice(0,i),actual=draws[i];addComparison(champion,predictOtherPrizes(history,{window}),actual);addComparison(challenger,predictOtherPrizesChallenger(history,{window}),actual);onProgress?.(i-start+1,trials);if((i-start)%2===1)await wait()}
 const c=finishComparison(champion),h=finishComparison(challenger),delta={exactRate:h.exactRate-c.exactRate,tail2Rate:h.tail2Rate-c.tail2Rate,positionAccuracy:h.positionAccuracy-c.positionAccuracy};
 const promote=trials>=50&&delta.exactRate>=0&&delta.tail2Rate>=.01&&delta.positionAccuracy>=.01;
 return{requestedTrials,trials,minimumTraining,champion:c,challenger:h,delta,promote,decision:promote?"Đề xuất Challenger":"Giữ Champion"};
}

export async function backtestDrift(draws,{recentSize=20,referenceSize=30,window=50,onProgress}={}){
 const needed=10+recentSize+referenceSize;if(!Array.isArray(draws)||draws.length<needed)throw new Error("Cần ít nhất "+needed+" kỳ để theo dõi suy giảm");
 const total=recentSize+referenceSize,start=draws.length-total,split=draws.length-recentSize,reference=emptyComparison(),recent=emptyComparison();
 for(let i=start;i<draws.length;i++){const result=predictOtherPrizes(draws.slice(0,i),{window}),target=i<split?reference:recent;addComparison(target,result,draws[i]);onProgress?.(i-start+1,total);if((i-start)%2===1)await wait()}
 const old=finishComparison(reference),now=finishComparison(recent),delta={exactRate:now.exactRate-old.exactRate,tail2Rate:now.tail2Rate-old.tail2Rate,positionAccuracy:now.positionAccuracy-old.positionAccuracy};
 const tailDrop=delta.tail2Rate<=-.015,positionDrop=delta.positionAccuracy<=-.01,status=tailDrop&&positionDrop?"Cảnh báo suy giảm":tailDrop||positionDrop?"Cần theo dõi":"Ổn định";
 return{referenceSize,recentSize,reference:old,recent:now,delta,status};
}
