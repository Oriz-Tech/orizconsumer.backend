const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');
const { v4: uuidv4 } = require('uuid');
const { startOfDay, endOfDay } = require('date-fns');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const { OpenAI } = require('openai');

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
  //   let medicalCondition = 'has no medical condition';
  //   let dietaryRestriction = 'has no dietary restriction';

  //   if (params.hasMedicationCondition == true) {
  //     medicalCondition = 'has a ' + params.medicalCondition;
  //   }

  //   if (params.hasDietaryRestriction == true) {
  //     dietaryRestriction = 'is ' + params.dietaryRestriction;
  //   }

  //   let planCorrelationId = uuidv4();
  //   let prompt = `Generate a meal plan and a fitness plan for someone
  //     who is ${params.typeOfWork} "and works as a ${params.occupation}. He is an ${params.dailyRoutine} who does not go to gym,
  //     looking to ${params.weightGoal} and ${medicalCondition}. His body weight is ${params.weight}kg and height of  ${params.height} cm
  //     ${params.enjoyedActivity} and willing to commit ${params.daysPerWeek} days a week of ${params.hoursPerDayForFitness} hours per day to a fitness goal
  //     and ${dietaryRestriction}. He gets ${params.sleepingHours} hours of sleep per night using this JSON Schema:
  //     {
  //       "type":"array",
  //       "properties": {
  //         "mealItem": {
  //           "type": "object",
  //           "properties": {
  //             "breakfast": {"type": "string"},
  //             "midmorning": {"type": "string"},
  //             "lunch": {"type": "string"},
  //             "midafternoon": {"type": "string"},
  //             "dinner": {"type": "string"}
  //           }
  //         },
  //         "fitnessItem": {
  //           "type": "object",
  //           "properties": {
  //             "warmup": {"type": "string"},
  //             "strength": {"type": "string"},
  //             "core": {"type": "string"},
  //             "cardio": {"type": "string"},
  //             "cooldown": {"type": "string"}
  //           }
  //         },
  //       }
  //     }
  // }`;

  //   const result = await model.generateContent(prompt);
  //   const response = await result.response;
  //   const text = response.text();

  //   let startIndex = text.indexOf('[');
  //   let endIndex = text.lastIndexOf(']');
  //   let jsonContent = text.substring(startIndex, endIndex + 1).trim();

  //   let data = JSON.parse(jsonContent);
  //   console.log(data);
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

  data = [
    {
      mealItem: {
        breakfast:
          '3 whole eggs scrambled with 1/4 cup chopped vegetables and 2 slices whole-wheat toast with avocado.  Large glass of whole milk.',
        midmorning: 'Greek yogurt (1 cup) with berries and a handful of almonds.',
        lunch:
          'Chicken breast salad sandwich on whole-wheat bread with mayonnaise, lettuce, tomato, and a side of sweet potato fries.',
        midafternoon:
          'Protein shake (whey or casein) with banana and a tablespoon of peanut butter.',
        dinner:
          '4oz grilled salmon, 1 cup brown rice, and 1 cup steamed broccoli.  A small serving of olive oil and balsamic vinegar dressing.'
      },
      fitnessItem: {
        warmup: '10 minutes of light cardio, such as jogging in place or jumping jacks.',
        strength:
          '3 sets of 10-12 repetitions of the following exercises: squats, push-ups, lunges, rows (using resistance bands or water bottles), overhead press (using resistance bands or water bottles).',
        core: '3 sets of 15-20 repetitions of the following exercises: planks, crunches, Russian twists, bicycle crunches.',
        cardio: 'Basketball game.  Focus on both offensive and defensive play for a full 3 hours.',
        cooldown:
          '10 minutes of stretching, focusing on major muscle groups worked during the workout.'
      }
    },
    {
      mealItem: {
        breakfast:
          'Oatmeal (1 cup) with 1/4 cup of fruit and a scoop of protein powder.  Glass of whole milk.',
        midmorning: 'Hard-boiled eggs (2) and a small apple.',
        lunch: 'Leftover salmon and brown rice from dinner.',
        midafternoon: 'Trail mix (nuts, seeds, dried fruit).',
        dinner:
          'Lean ground beef stir-fry with brown rice and mixed vegetables.  Use a minimal amount of healthy oil.'
      },
      fitnessItem: {
        warmup:
          'Dynamic stretching, such as arm circles, leg swings, and torso twists (10 minutes).',
        strength:
          'Repeat strength training routine from previous day, focusing on proper form and increasing weight or resistance if possible.',
        core: 'Repeat core exercises from previous day, focusing on maintaining good form and engaging your core throughout each repetition.',
        cardio:
          'Basketball game.  Focus on improving your endurance and specific skills such as shooting or dribbling for 3 hours.',
        cooldown: 'Cool-down stretching (10 minutes).'
      }
    },
    {
      mealItem: {
        breakfast:
          'Pancakes (2 small) made with whole wheat flour, topped with berries and a dollop of Greek yogurt.',
        midmorning: 'Peanut butter and banana sandwich on whole wheat bread.',
        lunch: 'Chicken breast and vegetable wrap (whole wheat tortilla).',
        midafternoon: 'Cottage cheese (1 cup) with chopped fruit.',
        dinner:
          'Chicken breast, sweet potato, and green beans.  Season with herbs and spices.  Small drizzle of olive oil.'
      },
      fitnessItem: {
        warmup: 'Jump rope (5 minutes) and light cardio (5 minutes).',
        strength:
          'Focus on plyometrics: Box jumps, jump squats, and other explosive exercises (3 sets of 8-10 repetitions).',
        core: 'Focus on isometric holds:  Plank variations, side plank, dead bug (30 seconds hold for each, 3 repetitions).',
        cardio: 'Basketball game.  Play a full court game for 3 hours.',
        cooldown: 'Yoga or foam rolling (15 minutes).'
      }
    }
  ];
  numberOfDays = 3;
  const currentDate = new Date();
  let dataResult = generateWeeklyPlanAndAnalytics(data, currentDate, numberOfDays, userId);
  
  // //generate plan for 7 days
  // weeklyPlan = generateWeeklyPlans(data, currentDate, numberOfDays, userId);
  
  // //create the week analytics 
  // const mealPlan = weeklyPlan.map
  // const weekAnalytics = {
  //   userId: userId, 
  //   weeklyPlanId: weeklyPlan[0].weeklyPlanId,
  //   activityTitle: 'mealPlan',
  //   numberOfActivities
  // }

  try {
    const addedResult = await prisma.UserRecommendationPlan.createMany({
      data: dataResult['week']
    });
    const addedAnalytics = await prisma.userWeeklyRecommendationPlan.createMany({
      data: dataResult['analytics']
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
      message: 'Error creating a plan',
      code: 'E01',
      data: null
    };
  }
  
  return {
    status: 200,
    message: 'Success',
    code: 'S00',
    data: dataResult
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
     endDate: weeklyPlan[weeklyPlan.length-1].dateCreatedFor
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
    endDate: weeklyPlan[weeklyPlan.length-1].dateCreatedFor
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
      dateCreatedFor: startDate.addDays(day)
    });
  }
  return weeklyPlan;
}
async function get_ai_recommendation(params) {
  let userId = params.userId;

  const start = startOfDay(new Date(params.day)); // Start of the day
  const end = endOfDay(new Date(params.day));
  const result = await prisma.userRecommendationPlan.findFirst({
    where: {
      userId: userId,
      dateCreatedFor: {
        gte: start, // Greater than or equal to the start of the day
        lte: end // Less than or equal to the end of the day
      }
    }
  });

  if(!result){
    return {
      status: 200,
      message: 'Success',
      code: 'S00',
      data: {}
    };
  }

  const data = {
    ...result,
    id: result.id.toString() // Convert BigInt to string
  };

  
  return {
    status: 200,
    message: 'Success',
    code: 'S00',
    data: data
  };
}

async function complete_plan_items(params) {
  try {
    const plan_item = await prisma.userPlan.update({
      where: {
        id: params.planId,
        userId: params.userId
      },
      data: {
        isDone: true,
        updatedAt: getCurrentDateUtc()
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
