export function bmi(weightKg,heightCm){if(!(weightKg>0&&heightCm>0))return null;return weightKg/(heightCm/100)**2;}
export function foodNutrition(food,grams){if(!food||!(grams>0))return null;const ratio=grams/100;return Object.fromEntries(['kcal','protein','carbs','fat'].map(k=>[k,Number(food[k]||0)*ratio]));}
export function sumNutrition(items,foods){const byId=new Map(foods.map(f=>[f.id,f]));return items.reduce((sum,item)=>{const n=foodNutrition(byId.get(item.foodId),item.grams);if(n)for(const k of Object.keys(sum))sum[k]+=n[k];return sum;},{kcal:0,protein:0,carbs:0,fat:0});}
export function trainingVolume(exercises){return (exercises||[]).flatMap(x=>x.sets||[]).filter(s=>s.done&&s.type!=='热身组').reduce((n,s)=>n+(Number(s.weight)||0)*(Number(s.reps)||0),0);}
export function estimateOneRepMax(weight,reps){if(!(weight>0&&reps>0&&reps<=12))return null;return weight*(1+reps/30);}
export function targetDifference(target,actual){if(!Number.isFinite(target)||!Number.isFinite(actual))return null;return target-actual;}
export function weeklyAverage(records,dateKey='date',valueKey='weight'){const byWeek=new Map();for(const r of records){const d=new Date(`${r[dateKey]}T12:00:00`);if(!Number.isFinite(d.getTime())||!Number.isFinite(+r[valueKey]))continue;d.setDate(d.getDate()-((d.getDay()+6)%7));const key=d.toISOString().slice(0,10);const values=byWeek.get(key)||[];values.push(+r[valueKey]);byWeek.set(key,values);}return [...byWeek].sort(([a],[b])=>a.localeCompare(b)).map(([week,values])=>({week,average:values.reduce((a,b)=>a+b,0)/values.length,count:values.length}));}
export function bmr({weightKg,heightCm,ageYears,sex}){if(!(weightKg>0&&heightCm>0&&ageYears>0)||!['male','female'].includes(sex))return null;return 10*weightKg+6.25*heightCm-5*ageYears+(sex==='male'?5:-161);}
export function tdee(bmrValue,activityFactor){if(!(bmrValue>0&&activityFactor>=1.2&&activityFactor<=2.0))return null;return bmrValue*activityFactor;}

