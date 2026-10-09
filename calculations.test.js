import test from 'node:test';
import assert from 'node:assert/strict';
import {bmi,foodNutrition,sumNutrition,trainingVolume,estimateOneRepMax,targetDifference,weeklyAverage,bmr,tdee} from './calculations.js';

test('BMI requires positive height and weight',()=>{assert.equal(bmi(70,175),70/(1.75**2));assert.equal(bmi(null,175),null);});
test('food quantity scales nutrition from 100g',()=>{assert.deepEqual(foodNutrition({kcal:200,protein:10,carbs:20,fat:5},150),{kcal:300,protein:15,carbs:30,fat:7.5});});
test('daily food totals exclude missing food rows',()=>{assert.deepEqual(sumNutrition([{foodId:'a',grams:50},{foodId:'missing',grams:100}],[{id:'a',kcal:100,protein:10,carbs:10,fat:2}]),{kcal:50,protein:5,carbs:5,fat:1});});
test('training volume excludes warm-up sets',()=>{assert.equal(trainingVolume([{sets:[{done:true,type:'热身组',weight:20,reps:10},{done:true,type:'正式组',weight:50,reps:8},{done:false,weight:100,reps:1}]}]),400);});
test('one rep max estimate rejects high rep estimates',()=>{assert.equal(estimateOneRepMax(60,5),70);assert.equal(estimateOneRepMax(60,15),null);});
test('target difference preserves overshoot as negative',()=>{assert.equal(targetDifference(1800,2000),-200);assert.equal(targetDifference(null,1),null);});
test('weekly averages use only provided measurements',()=>{assert.deepEqual(weeklyAverage([{date:'2026-10-05',weight:70},{date:'2026-10-06',weight:72}]),[{week:'2026-10-05',average:71,count:2}]);});
test('BMR and TDEE are not fabricated when required values are missing',()=>{assert.equal(bmr({weightKg:70,heightCm:175,ageYears:null,sex:'male'}),null);assert.equal(tdee(1600,1.5),2400);assert.equal(tdee(1600,0),null);});

