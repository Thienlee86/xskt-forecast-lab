import{predictOtherPrizes,PRIZE_TIERS}from"./model-prizes.js";
const wait=()=>new Promise(r=>setTimeout(r,0));
function bestPosition(number,actual){let best=0;for(const a of actual){let hit=0;for(let i=0;i<number.length;i++)if(number[i]===a[i])hit++;best=Math.max(best,hit)}return best}
export async function backtestOtherPrizes(draws,{testSize=30,window=50,onProgress}={}){
 if(!Array.isArray(draws)||draws.length<20)throw new Error("Cần ít nhất 20 kỳ để kiểm định 8 giải");
 const trials=Math.min(Math.max(10,+testSize||30),draws.length-10),start=draws.length-trials;
 const stats=Object.fromEntries(PRIZE_TIERS.map(t=>[t.key,{...t,trials:0,exact:0,positions:0,tail2:0,randomExact:0,randomTail2:0}]));
 for(let i=start;i<draws.length;i++){const result=predictOtherPrizes(draws.slice(0,i),{window}),actual=draws[i];for(const p of result.tiers){const values=actual.prizes[p.key]||[],s=stats[p.key];s.trials++;if(values.includes(p.representative))s.exact++;s.positions+=bestPosition(p.representative,values)/p.digits;const tails=new Set(values.map(x=>x.slice(-2)));if(tails.has(p.representative.slice(-2)))s.tail2++;s.randomExact+=new Set(values).size/(10**p.digits);s.randomTail2+=tails.size/100}onProgress?.(i-start+1,trials);if((i-start)%2===1)await wait()}
 return{trials,window,rows:PRIZE_TIERS.map(t=>{const s=stats[t.key];return{key:t.key,label:t.label,digits:t.digits,trials:s.trials,exactRate:s.exact/s.trials,randomExactRate:s.randomExact/s.trials,positionAccuracy:s.positions/s.trials,tail2Rate:s.tail2/s.trials,randomTail2Rate:s.randomTail2/s.trials}})};
}
