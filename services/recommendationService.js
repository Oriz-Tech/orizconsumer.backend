const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');
const { v4: uuidv4 } = require('uuid');
const { startOfDay, endOfDay, getWeekOfMonth } = require('date-fns');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const { OpenAI } = require('openai');
const logger = require('../config/loggerConfig');

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'] // This is the default and can be omitted
});

// "type": "object",
//   "properties": {
//     "day": { "type": "string" },
//     "mealPlan": {
//       "type": "array",
//       "items": {
//         "type": "object",
//         "properties": {
//           "mealItem": { "type": "string" },
//           "isDone": { "type": "boolean" },
//           "id": ${uuidv4()}
//         }
//       },
//       "workoutPlan": {
//       "type": "array",
//       "items": {
//         "type": "object",
//         "properties": {
//           "workoutItem": { "type": "string" },
//           "isDone": { "type": "boolean" },
//           "id": ${uuidv4()}
//         }
//       }
//     },
//     "userId": ${userId},
//     "planCorrelationId": ${planCorrelationId},
//     "isActive": ${true}
async function generate_plan_openai(params) {
  let userId = params.userId;
  let currentDate = getCurrentDateUtc().toISOString().slice(0, 19).replace('T', ' ');
  let medicalCondition = 'has no medical condition';
  let dietaryRestriction = 'has no dietary restriction';

  if (params.hasMedicationCondition == true) {
    medicalCondition = 'has a ' + params.medicalCondition;
  }

  if (params.hasDietaryRestriction == true) {
    dietaryRestriction = 'is ' + params.dietaryRestriction;
  }

  let planCorrelationId = uuidv4();
  let prompt = `Generate a meal and fitness plan for someone 
    who is ${params.typeOfWork} "and works as a ${params.occupation}. He is an ${params.dailyRoutine} who does not go to gym, 
    looking to ${params.weightGoal} and ${medicalCondition}. His body weight is ${params.weight}kg and height of  ${params.height} cm  
    ${params.enjoyedActivity} and willing to commit ${params.daysPerWeek} days a week of ${params.hoursPerDayForFitness} hours per day to a fitness goal
    and ${dietaryRestriction}. He gets ${params.sleepingHours} hours of sleep per night using this JSON Schema: 
    {   
        "type": "object",
        "properties": {
            "day": { "type": "string" },
            "mealPlan": { "type": "object", "properties": {"breakfast"} },
            "fitnessPlan":{ "type": "string" },
            "isDone": {"type":"boolean"},
            "userId": ${userId},
            "planCorrelationId": ${planCorrelationId}, 
            "isActive": ${true}
        }
    }`;

  const completion = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4o-mini'
  });

  console.log(completion.choices[0].message);
}

async function generate_plan(params) {
  //verify subscription
  //see if they have an active plan

  let userId = params.userId;
  const user = await prisma.user.findFirst({
    where:{
      id: userId
    }
  })
  if(!user){
    return {
      status: 400,
      message: 'Invalid User details',
      code: 'S00',
      data: null
    };
  }

  if(user.hasActivePlan){
    return {
      status: 400,
      message: 'User has an Active Plan',
      code: 'S00',
      data: null
    };
  }
  //   let currentDate = getCurrentDateUtc().toISOString().slice(0, 19).replace('T', ' ');
    let medicalCondition = 'has no medical condition';
    let dietaryRestriction = 'has no dietary restriction';

    if (params.hasMedicationCondition == true) {
      medicalCondition = 'has a ' + params.medicalCondition;
    }

    if (params.hasDietaryRestriction == true) {
      dietaryRestriction = 'is ' + params.dietaryRestriction;
    }

    let planCorrelationId = uuidv4();
    logger.info('Starting to generate the meal plan using AI ');


    let prompt = `Generate a meal plan and a fitness plan for someone
      who is ${params.typeOfWork} "and works as a ${params.occupation}. He is an ${params.dailyRoutine} who does not go to gym,
      looking to ${params.weightGoal} and ${medicalCondition}. His body weight is ${params.weight}kg and height of  ${params.height} cm
      ${params.enjoyedActivity} and willing to commit ${params.daysPerWeek} days a week of ${params.hoursPerDayForFitness} hours per day to a fitness goal
      and ${dietaryRestriction}. He gets ${params.sleepingHours} hours of sleep per night using this JSON Schema:
      {
        "type":"array",
        "properties": {
          "mealItem": {
            "type": "object",
            "properties": {
              "breakfast": {"type": "string"},
              "midmorning": {"type": "string"},
              "lunch": {"type": "string"},
              "midafternoon": {"type": "string"},
              "dinner": {"type": "string"}
            }
          },
          "fitnessItem": {
            "type": "object",
            "properties": {
              "warmup": {"type": "string"},
              "strength": {"type": "string"},
              "core": {"type": "string"},
              "cardio": {"type": "string"},
              "cooldown": {"type": "string"}
            }
          },
        }
      }
  }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    logger.info('Completed ai model generation');

    let startIndex = text.indexOf('[');
    let endIndex = text.lastIndexOf(']');
    let jsonContent = text.substring(startIndex, endIndex + 1).trim();

    let data = JSON.parse(jsonContent);

    logger.info('Parsing the data');
    console.log(data);
  // const addedResult = await prisma.userPlan.createMany({
  //     data:data
  // })

  // //save request
  let request = {
    typeOfWork: params.typeOfWork,
    occupation: params.occupation,
    dailyRoutine: params.dailyRoutine,
    weightGoal: params.weightGoal,
    hasMedicationCondition: params.hasMedicationCondition,
    medicalCondition: params.medicalCondition,
    hasDietaryRestriction: params.hasDietaryRestriction,
    dietaryRestriction: params.dietaryRestriction,
    weight: params.weight,
    height: params.height,
    enjoyedActivity: params.enjoyedActivity,
    daysPerWeek: params.daysPerWeek,
    hoursPerDay: params.hoursPerDayForFitness,
    sleepingHours: params.sleepingHours,
    userId: userId,
    planCorrelationId: ''
  };

  const requestResult = await prisma.userPlanSettings.create({
    data: request
  });

  let dailyPlans = []
  let weeklyAnalytics = []
  numberOfDays = 7;
  let currentDate = new Date();
  for(let wk=0; wk<4; wk++){
    let dataResult = generateWeeklyPlanAndAnalytics(data, currentDate, numberOfDays, userId);
    dailyPlans = dailyPlans.concat(dataResult['week'])
    weeklyAnalytics= weeklyAnalytics.concat(dataResult['analytics'])
    currentDate = currentDate.addDays(numberOfDays)

    logger.info(`generated plans \n: ${dailyPlans.length} daily plans`)

  }

  try {
    const addedResult = await prisma.userRecommendationPlan.createMany({
      data: dailyPlans
    });
    const addedAnalytics = await prisma.userWeeklyRecommendationPlan.createMany({
      data: weeklyAnalytics
    })
    const updateUser = await prisma.user.update({
      where:{
        id: userId
      },
      data:{
        hasActivePlan: true
      }
    })
  } catch (error) {
    console.log(error)
    return {
      status: 400,
      message: `Error creating a plan ${error}`,
      code: 'E01',
      data: null
    };
  }
  
  return {
    status: 200,
    message: 'Success',
    code: 'S00',
    data: null
  };
}

function generateWeeklyPlanAndAnalytics(data, startDate, numberOfDays, userId) {
   //generate plan for 7 days
   weeklyPlan = generateWeeklyPlans(data, startDate, numberOfDays, userId);
   
  
   //create the week analytics 
   let mealPlanNumberOfActivities = 0
   let mealPlanTotalPoints = 0

   weeklyPlan.forEach(element => {
      mealPlanNumberOfActivities = mealPlanNumberOfActivities 
        + element.mealPlan.length;
      mealPlanTotalPoints = mealPlanTotalPoints 
          + element.mealPlan.reduce((sum, item) => sum + (item.point || 0), 0);
   });

   //create the week analytics 
   let fitnessPlanNumberOfActivities = 0
   let fitnessPlanTotalPoints = 0

   weeklyPlan.forEach(element => {
    fitnessPlanNumberOfActivities = fitnessPlanNumberOfActivities 
        + element.fitnessPlan.length;
        fitnessPlanTotalPoints = fitnessPlanTotalPoints 
          + element.fitnessPlan.reduce((sum, item) => sum + (item.point || 0), 0);
   });

   const analytics = []
   analytics.push( {
     userId: userId, 
     weeklyPlanId: weeklyPlan[0].weeklyPlanId,
     activityTitle: 'mealPlan',
     numberOfActivities: mealPlanNumberOfActivities,
     activitiesCompleted: 0,
     pointsGained: 0,
     totalPoints: mealPlanTotalPoints,
     isActive: true,
     startDate: weeklyPlan[0].dateCreatedFor,
     endDate: weeklyPlan[weeklyPlan.length-1].dateCreatedFor,
     subtitle: ''
   }, {
    userId: userId, 
    weeklyPlanId: weeklyPlan[0].weeklyPlanId,
    activityTitle: 'fitnessPlan',
    numberOfActivities: fitnessPlanNumberOfActivities,
    activitiesCompleted: 0,
    pointsGained: 0,
    totalPoints: fitnessPlanTotalPoints,
    isActive: true,
    startDate: weeklyPlan[0].dateCreatedFor,
    endDate: weeklyPlan[weeklyPlan.length-1].dateCreatedFor,
    subtitle:''
  })



   //console.log(weekAnalytics)
   return {'week': weeklyPlan, 'analytics': analytics};
}

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

function generateWeeklyPlans(data, startDate, numberOfDays, userId) {
  const mealTitles = ['breakfast', 'midmorning', 'lunch', 'midafternoon', 'dinner'];
  const fitnessTitles = ['warmup', 'strength', 'core', 'cardio', 'cooldown'];

  // Function to get random meal or fitness item from the list
  function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  // Generate meal and fitness plan for each day
  const weeklyPlan = [];
  const weeklyPlanId = uuidv4();
  for (let day = 0; day < numberOfDays; day++) {
    const dailyPlanId = uuidv4();
    const dailyMealPlan = mealTitles.map((title) => ({
      title: title,
      detail: getRandomItem(data).mealItem[title], // Get random meal for the day
      point: Math.floor(Math.random() * 30) + 10, // Random points between 10 and 40
      isDone: false,
      planDetailId: `${dailyPlanId}-${title}-${Math.floor(Math.random() * 10000)}`
    }));

    const dailyFitnessPlan = fitnessTitles.map((title) => ({
      title: title,
      detail: getRandomItem(data).fitnessItem[title], // Get random fitness activity for the day
      point: Math.floor(Math.random() * 30) + 10, // Random points between 10 and 40
      isDone: false,
      planDetailId: `${dailyPlanId}-${title}-${Math.floor(Math.random() * 10000)}`
    }));

    //console.log(startDate)
    weeklyPlan.push({
      userId: userId,
      dailyPlanId: dailyPlanId,
      weeklyPlanId: weeklyPlanId,
      numberOfActivities: dailyMealPlan.length + dailyFitnessPlan.length,
      activitiesCompleted: 0,
      pointsGained: 0,
      totalPoints:
        dailyMealPlan.reduce((sum, item) => sum + (item.point || 0), 0) +
        dailyFitnessPlan.reduce((sum, item) => sum + (item.point || 0), 0),
      mealPlan: dailyMealPlan,
      fitnessPlan: dailyFitnessPlan,
      isActive: true,
      dateCreatedFor: startDate.addDays(day),

      mealNumberOfActivities: dailyMealPlan.length,
      mealTotalPoints: dailyMealPlan.reduce((sum, item) => sum + (item.point || 0), 0),

      fitnessNumberOfActivities:  dailyFitnessPlan.length,
      fitnessTotalPoints: dailyFitnessPlan.reduce((sum, item) => sum + (item.point || 0), 0)
    });
  }
  return weeklyPlan;
}

async function get_ai_recommendation(params) {
  let userId = params.userId;
  let data = null;

  switch (params.filter) {
    case 'day':
      if (params.day && params.month && params.year) {
        params.day = `${params.year}-${params.month}-${params.day}`
        const start = startOfDay(new Date(params.day)); // Start of the day
        const end = endOfDay(new Date(params.day));
        result = await prisma.userRecommendationPlan.findFirst({
          where: {
            userId: userId,
            dateCreatedFor: {
              gte: start, // Greater than or equal to the start of the day
              lte: end // Less than or equal to the end of the day
            }
          }
        });
      }
      if(result){
        data = {
          ...result,
          id: result.id.toString() // Convert BigInt to string
        };
      }
      break;
    
    case 'month':
      if(params.month && params.year){
        const startOfMonth = new Date(params.year, params.month-1, 1); // month is 1-based, but JavaScript Date is 0-based
        const endOfMonth = new Date(params.year, params.month, 1)

        result = await prisma.userWeeklyRecommendationPlan.findMany({
          where:{
            userId: userId,
            startDate: {
              gte: startOfMonth, // Greater than or equal to the start of the day
              lte: endOfMonth // Less than or equal to the end of the day
            }
          }
        })
        if(result){
          data = result.reduce((acc, item) => {
            const startDate = new Date(item.startDate);
            const weekOfMonth = getWeekOfMonth(startDate);
            item.weekOfMonth = weekOfMonth;
            if (!acc[item.activityTitle]) {
              acc[item.activityTitle] = [];
            }
            acc[item.activityTitle].push(item);
            return acc;
          }, {});
      }
      }
      break;

    case 'week':
      if(params.week){

        result = await prisma.userRecommendationPlan.findMany({
          where:{
            userId: userId,
            weeklyPlanId: params.week
          },
          select:{
            dateCreatedFor: true, 
            dailyPlanId:true, 
            weeklyPlanId: true,
            fitnessActivitiesCompleted:true, 
            fitnessNumberOfActivities:true, 
            fitnessPointsGained:true, 
            fitnessTotalPoints: true, 
            mealActivitiesCompleted:true, 
            mealNumberOfActivities:true, 
            mealPointsGained:true, 
            mealTotalPoints: true,     
          }
        })
        if(result){
          data = {
            "mealPlan": result.map(({ fitnessActivitiesCompleted, fitnessNumberOfActivities,
              fitnessPointsGained, fitnessTotalPoints, ...rest }) => rest),
            "fitnessPlan": result.map(({ mealNumberOfActivities, mealActivitiesCompleted,
              mealTotalPoints, mealPointsGained , ...rest }) => rest)
          }
        }
      }
      break;

    default:
      return {
        status: 200,
        message: 'Success',
        code: 'S00',
        data: {}
      };
      break;
  }
  

  
  function serializeBigInt(obj) {
    return JSON.parse(
      JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }
  
  if (!data) {
    return {
      status: 200,
      message: 'Success',
      code: 'S00',
      data: {}
    };
  }

  return {
    status: 200,
    message: 'Success',
    code: 'S00',
    data: serializeBigInt(data)
  };
}

async function complete_plan_items(params) {
  try {
    let dailyplanId = params.planDetailIds[0].split('-').slice(0,-2).join('-');
    let weekId = null;

    let plan_item = await prisma.userRecommendationPlan.findFirst({
      where: {
        dailyPlanId: dailyplanId,
        userId: params.userId
      }
    });
    if (plan_item == null) {
      return {
        status: 400,
        message: 'Could not update plan settings. Kindly try again later.',
        code: 'E00',
        data: null
      };
    }

    plan_item.mealPlan.forEach(element => {
      if(params.planDetailIds.includes(element.planDetailId)){
        console.log(element.isDone)
        if(!element.isDone){
          element.isDone = true;
          plan_item.mealPointsGained += element.point;
          plan_item.mealActivitiesCompleted +=1;
          plan_item.activitiesCompleted +=1;
          plan_item.pointsGained += element.point;
        }
      }
    });

    plan_item.fitnessPlan.forEach(element => {
      if(params.planDetailIds.includes(element.planDetailId)){
        if(!element.isDone){
          element.isDone = true;
          plan_item.fitnessPointsGained += element.point;
          plan_item.fitnessActivitiesCompleted +=1;
          plan_item.activitiesCompleted +=1;
          plan_item.pointsGained += element.point;
        }
      }
    });

    try {
      const updatePlanItem = await prisma.userRecommendationPlan.update({
        where:{
          id: plan_item.id
        },
        data:plan_item
      })

      const weeklyMealPlan = await prisma.userWeeklyRecommendationPlan.update({
        where:{
          user_id:{
            weeklyPlanId: plan_item.weeklyPlanId, 
            userId: params.userId,
            activityTitle: 'mealPlan'
          }
        }, 
        data:{
          activitiesCompleted: plan_item.mealActivitiesCompleted,
          pointsGained: plan_item.pointsGained,
          dateUpdateAt: new Date()
        }

      })

      const weeklyFitnessPlan = await prisma.userWeeklyRecommendationPlan.update({
        where:{
          user_id:{
            weeklyPlanId: plan_item.weeklyPlanId, 
            userId: params.userId,
            activityTitle: 'fitnessPlan'
          }
        }, 
        data:{
          activitiesCompleted: plan_item.mealActivitiesCompleted,
          pointsGained: plan_item.pointsGained,
          dateUpdateAt: new Date()
        }

      })
    } catch (error) {
      console.log(error)
      return {
        status: 400,
        message: 'Error while trying to complete items',
        code: 'E00',
        data: null
      };
    }


    return {
      status: 200,
      message: 'Plan item completed',
      code: 'S00',
      data: null
    };
  } catch (error) {
    logger.log(error, 'complete_plan_items failed ' + error);
    return { status: 500, message: 'An Error occured', code: 'E00', data: null };
  }
}

module.exports = {
  generate_plan,
  get_ai_recommendation,
  complete_plan_items
};
