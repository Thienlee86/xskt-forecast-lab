export const PRIZE_MODEL_VERSION="representative-prizes-v1.0.0";
export const PRIZE_TIERS=[
 {key:"g8",label:"Giải 8",digits:2},{key:"g7",label:"Giải 7",digits:3},
 {key:"g6",label:"Giải 6",digits:4},{key:"g5",label:"Giải 5",digits:4},
 {key:"g4",label:"Giải 4",digits:5},{key:"g3",label:"Giải 3",digits:5},
 {key:"g2",label:"Giải 2",digits:5},{key:"g1",label:"Giải 1",digits:5}
];
const topDigits=(counts,k)=>counts.map((v,d)=>({d:String(d),v})).sort((a,b)=>b.v-a.v||a.d.localeCompare(b.d)).slice(0,k).map(x=>x.d);
function buildTier(draws,tier){
 const samples=draws.flatMap(d=>Array.isArray(d.prizes?.[tier.key])?d.prizes[tier.key]:[]).filter(x=>/^\d+$/.test(x)&&x.length===tier.digits);
 if(!samples.length)throw new Error("Không đủ dữ liệu cho "+tier.label);
 const pos=Array.from({length:tier.digits},()=>Array(10).fill(1));
 const pairs=Array.from({length:tier.digits-1},()=>Array(100).fill(1));
 const sums=Array(9*tier.digits+1).fill(1);
 for(const s of samples){let sum=0;for(let i=0;i<tier.digits;i++){const d=+s[i];pos[i][d]++;sum+=d;if(i<tier.digits-1)pairs[i][+(s[i]+s[i+1])]++}sums[sum]++}
 const k=tier.digits<=3?8:tier.digits===4?6:5, choices=pos.map(x=>topDigits(x,k)), candidates=[];
 function walk(i,s){if(i===tier.digits){candidates.push(s);return}for(const d of choices[i])walk(i+1,s+d)}
 walk(0,"");
 const pDen=pos.map(x=>x.reduce((a,b)=>a+b,0)),pairDen=pairs.map(x=>x.reduce((a,b)=>a+b,0)),sumDen=sums.reduce((a,b)=>a+b,0);
 const ranked=candidates.map(number=>{let sum=0,position=0,pair=0;for(let i=0;i<tier.digits;i++){const d=+number[i];sum+=d;position+=Math.log(pos[i][d]/pDen[i]);if(i<tier.digits-1)pair+=Math.log(pairs[i][+(number[i]+number[i+1])]/pairDen[i])}const score=.72*(position/tier.digits)+.2*(pair/Math.max(1,tier.digits-1))+.08*Math.log(sums[sum]/sumDen);return{number,sum,score}}).sort((a,b)=>b.score-a.score||a.number.localeCompare(b.number));
 const shortlist=ranked.slice(0,10),max=shortlist[0].score,weights=shortlist.map(x=>Math.exp(x.score-max)),den=weights.reduce((a,b)=>a+b,0);
 return{...tier,observations:samples.length,candidatesEvaluated:candidates.length,representative:shortlist[0].number,sum:shortlist[0].sum,relativeWeight:weights[0]/den,alternatives:shortlist.map((x,i)=>({...x,relativeWeight:weights[i]/den}))};
}
export function predictOtherPrizes(draws,{window=50}={}){
 if(!Array.isArray(draws)||draws.length<10)throw new Error("Cần ít nhất 10 kỳ để dự báo các giải");
 const selected=draws.slice(-Math.min(+window||50,draws.length));
 return{version:PRIZE_MODEL_VERSION,window,trainingSize:selected.length,tiers:PRIZE_TIERS.map(t=>buildTier(selected,t))};
}
