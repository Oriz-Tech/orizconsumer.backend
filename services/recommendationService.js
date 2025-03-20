const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');
const { v4: uuidv4 } = require('uuid');
const { startOfDay, endOfDay, getWeekOfMonth } = require('date-fns');
const workoutActivities = require('../utils/activitiesList');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const { OpenAI } = require('openai');
const logger = require('../config/loggerConfig');
const { pl } = require('date-fns/locale');

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'] // This is the default and can be omitted
});

async function generate_plan(params) {
  if (!params.plan) {
    return {
      status: 400,
      message: 'Plan type is required',
      code: 'S00',
      data: null
    };
  }
  let userId = params.userId;
  const user = await prisma.user.findFirst({
    where: {
      id: userId
    }
  });
  if (!user) {
    return {
      status: 400,
      message: 'Invalid User details',
      code: 'S00',
      data: null
    };
  }

  if (user.hasActiveFitnessPlan && user.hasActiveMealPlan && user.hasActiveWellnessPlan) {
    return {
      status: 400,
      message: 'User has an Active Plan',
      code: 'S00',
      data: null
    };
  }

  if (user.hasActiveFitnessPlan && params.plan === 'fitness') {
    return {
      status: 400,
      message: 'User has an Active Fitness Plan',
      code: 'S00',
      data: null
    };
  }

  if (user.hasActiveWellnessPlan && params.plan === 'wellness') {
    return {
      status: 400,
      message: 'User has an Active Wellness Plan',
      code: 'S00',
      data: null
    };
  }

  if (user.hasActiveMealPlan && params.plan === 'meal') {
    return {
      status: 400,
      message: 'User has an Active meal Plan',
      code: 'S00',
      data: null
    };
  }

  let medicalCondition = 'has no medical condition';
  let dietaryRestriction = 'has no dietary restriction';

  if (params.hasMedicationCondition == true) {
    medicalCondition = 'has a ' + params.medicalCondition;
  }

  if (params.hasDietaryRestriction == true) {
    dietaryRestriction = 'is ' + params.dietaryRestriction;
  }

  logger.info('Starting to generate the meal plan using AI ');
  let prompt = '';

  switch (params.plan) {
    case 'meal':
      prompt = `Generate a meal plan for someone who is ${params.typeOfWork} "and works as a ${params.occupation}. He is an ${params.dailyRoutine} who does not go to gym,
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
            }
          }
        }`;
      break;
    case 'fitness':
      prompt = `Create a personalized 3-day fitness plan with exercise activities 
      from the following lists ${JSON.stringify(workoutActivities)} to fit within
      the following parameters: 
      the individual goal is to ${params.weightGoal}, 
      they are ${params.activity}, prefer ${params.workoutType} workouts, 
      and are willing to commit to ${params.daysPerWeek} days per week. 
      They also have ${params.allergies} allergies.
      Include walks and runs, and provide each workout in 
      reps and sets with proper workout terminology.For each activity, 
      offer a one-sentence short description, make the title two words
       and structure the plan using this JSON schema:
        {
          "type":"array",
          "properties": {
            "fitnessItem": {
              "type": "object",
              "properties": {
                "warmup": {
                  "type": "object", 
                  "properties":{
                  "title": {"type": "string"},
                    "description": {"type": "string"},
                    "sets": {"type": "Integer"},
                    "reps": {"type": "Integer"},
                    "videourl": ""
                  }
                },
                "strength": {
                  "type": "object", 
                  "properties":{
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "sets": {"type": "Integer"},
                    "reps": {"type": "Integer"},
                    "videourl": ""
                  }
                },
                "core": {
                  "type": "object", 
                  "properties":{
                  "title": {"type": "string"},
                    "description": {"type": "string"},
                    "sets": {"type": "Integer"},
                    "reps": {"type": "Integer"},
                    "videourl": ""
                  }
                },
                "cardio": {
                  "type": "object", 
                  "properties":{
                  "title": {"type": "string"},
                    "description": {"type": "string"},
                    "sets": {"type": "Integer"},
                    "reps": {"type": "Integer"},
                    "videourl": ""
                  }
                },
                "cooldown": {
                  "type": "object", 
                  "properties":{
                  "title": {"type": "string"},
                    "description": {"type": "string"},
                    "sets": {"type": "Integer"},
                    "reps": {"type": "Integer"},
                    "videourl": ""
                  }
                }
              }
            }
          }
        }`;
      break;
    case 'wellness':
      prompt = `Generate a wellness plan for someone who is ${params.typeOfWork} "and works as a ${params.occupation}. He is an ${params.dailyRoutine} who does not go to gym,
        looking to ${params.weightGoal} and ${medicalCondition}. His body weight is ${params.weight}kg and height of  ${params.height} cm
        ${params.enjoyedActivity} and willing to commit ${params.daysPerWeek} days a week of ${params.hoursPerDayForFitness} hours per day to a fitness goal
        and ${dietaryRestriction}. He gets ${params.sleepingHours} hours of sleep per night using this JSON Schema:
        {
          "type":"array",
          "properties": {
            "fitnessItem": {
              "type": "object",
              "properties": {
                "warmup": {"type": "string"},
                "strength": {"type": "string"},
                "core": {"type": "string"},
                "cardio": {"type": "string"},
                "cooldown": {"type": "string"}
              }
            }
          }
        }`;
      break;
  }

  //console.log(prompt);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  logger.info('Completed ai model generation');
  //logger.info(text);
  //return;

  let startIndex = text.indexOf('[');
  let endIndex = text.lastIndexOf(']');
  let jsonContent = text.substring(startIndex, endIndex + 1).trim();

  let data = JSON.parse(jsonContent);

  logger.info('Parsing the data');
  
  // //save request
  const planRequestSettings = await prisma.userPlanSettings.findFirst({
    where: {
      userId: userId
    }
  });

  let planRequestSettingsFields = {};

  // Check the planType and update the corresponding field
  if (params.plan === 'meal') {
    planRequestSettingsFields.mealPlanSetting = params;
  } else if (params.plan === 'fitness') {
    planRequestSettingsFields.fitnessPlanSetting = params;
  } else if (params.plan === 'wellness') {
    planRequestSettingsFields.wellnessPlanSetting = params;
  }

  if (planRequestSettings) {
    await prisma.userPlanSettings.update({
      where: {
        id: planRequestSettings.id
      },
      data: planRequestSettingsFields
    });
  } else {
    await prisma.userPlanSettings.create({
      data: {
        userId: userId,
        ...planRequestSettingsFields
      }
    });
  }

  const previousPlans = await prisma.userRecommendationPlan.findMany({
    where: {
      userId: userId,
      isActive: true
    }
  });
  const prevWeeklyPlans = await prisma.userWeeklyRecommendationPlan.findMany({
    where: {
      userId: userId,
      isActive: true
    }
  });

  if (previousPlans.length > 0) {
    if (params.plan == 'fitness') {
      console.log('updating fitness plan');
      const fitnessTitles = ['warmup', 'strength', 'core', 'cardio', 'cooldown'];
      const getRandomItem = (items) => items[Math.floor(Math.random() * items.length)];
      const createPlan = (titles, dataKey, dailyPlanId) =>
        titles.map((title) => ({
          title,
          detail: getRandomItem(data)[dataKey][title],
          point: Math.floor(Math.random() * 30) + 10,
          isDone: false,
          planDetailId: `${dailyPlanId}-${title}-${Math.floor(Math.random() * 10000)}`
        }));

      const getObjectByValue = (list, key, value) => {
        return list.find((obj) => obj[key] === value);
      };

      newWeekAnalytics = [];
      //console.log(previousPlans)
      for (let i = 0; i < previousPlans.length; i++) {
        plan = previousPlans[i];
        newFitnessPlan = createPlan(fitnessTitles, 'fitnessItem', plan.dailyPlanId);

        weekValue = getObjectByValue(newWeekAnalytics, 'weeklyPlanId', plan.weeklyPlanId);

        if (weekValue) {
          weekValue.numberOfActivities += newFitnessPlan.length;
          weekValue.totalPoints += newFitnessPlan.reduce((sum, item) => sum + (item.point || 0), 0);
          //console.log(weekValue);
        } else {
          prevWeekPlan = getObjectByValue(prevWeeklyPlans, 'weeklyPlanId', plan.weeklyPlanId);
          weekValue = {
            userId,
            weeklyPlanId: plan.weeklyPlanId,
            activityTitle: 'fitnessPlan',
            numberOfActivities: newFitnessPlan.length,
            activitiesCompleted: 0,
            pointsGained: 0,
            totalPoints: newFitnessPlan.reduce((sum, item) => sum + (item.point || 0), 0),
            isActive: true,
            startDate: prevWeekPlan.startDate,
            endDate: prevWeekPlan.endDate,
            subtitle: ''
          };

          //console.log(weekValue);
          newWeekAnalytics.push(weekValue);
        }
        await prisma.userRecommendationPlan.update({
          where: {
            id: plan.id
          },
          data: {
            fitnessPlan: newFitnessPlan,
            fitnessNumberOfActivities: newFitnessPlan.length,
            fitnessTotalPoints: newFitnessPlan.reduce((sum, item) => sum + (item.point || 0), 0)
          }
        });

        console.log(i);
      }

      await prisma.userWeeklyRecommendationPlan.createMany({
        data: newWeekAnalytics
      });

      await prisma.user.update({
        where: {
          id: userId
        },
        data: { hasActiveFitnessPlan: true, dateupdatedutc: new Date() }
      });

      console.log(newWeekAnalytics);
      return {
        status: 200,
        message: 'Success',
        code: 'S00',
        data: null
      };
    }
    //query to update the previous plan
  }

  let dailyPlans = [];
  let weeklyAnalytics = [];
  numberOfDays = 7;
  let currentDate = new Date();
  for (let wk = 0; wk < 2; wk++) {
    let dataResult = generateWeeklyPlanAndAnalytics(
      data,
      currentDate,
      numberOfDays,
      userId,
      params.plan
    );
    dailyPlans = dailyPlans.concat(dataResult['week']);
    weeklyAnalytics = weeklyAnalytics.concat(dataResult['analytics']);
    currentDate = currentDate.addDays(numberOfDays);

    logger.info(`generated plans \n: ${dailyPlans.length} daily plans`);
  }

  try {
    const addedResult = await prisma.userRecommendationPlan.createMany({
      data: dailyPlans
    });
    const addedAnalytics = await prisma.userWeeklyRecommendationPlan.createMany({
      data: weeklyAnalytics
    });

    let updatedFields = {};

    // Check the planType and update the corresponding field
    if (params.plan === 'meal') {
      updatedFields.hasActiveMealPlan = true;
    } else if (params.plan === 'fitness') {
      updatedFields.hasActiveFitnessPlan = true;
    } else if (params.plan === 'wellness') {
      updatedFields.hasActiveWellnessPlan = true;
    }

    const updateUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: updatedFields
    });
  } catch (error) {
    console.log(error);
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

function generateWeeklyPlanAndAnalytics(data, startDate, numberOfDays, userId, plan) {
  // Generate weekly plan for a specific plan type (meal, fitness, or wellness)
  const weeklyPlan = generateWeeklyPlans(data, startDate, numberOfDays, userId, plan);

  // Function to calculate total activities and points
  const calculatePlanAnalytics = (planType) => {
    let numberOfActivities = 0;
    let totalPoints = 0;

    weeklyPlan.forEach((element) => {
      const plan = element[`${planType}Plan`];
      numberOfActivities += plan.length;
      totalPoints += plan.reduce((sum, item) => sum + (item.point || 0), 0);
    });

    return { numberOfActivities, totalPoints };
  };

  let analytics = [];
  switch (plan) {
    case 'meal':
      const mealAnalytics = calculatePlanAnalytics('meal');
      analytics = [
        {
          userId,
          weeklyPlanId: weeklyPlan[0].weeklyPlanId,
          activityTitle: 'mealPlan',
          numberOfActivities: mealAnalytics.numberOfActivities,
          activitiesCompleted: 0,
          pointsGained: 0,
          totalPoints: mealAnalytics.totalPoints,
          isActive: true,
          startDate: weeklyPlan[0].dateCreatedFor,
          endDate: weeklyPlan[weeklyPlan.length - 1].dateCreatedFor,
          subtitle: ''
        }
      ];
      break;
    case 'fitness':
      const fitnessAnalytics = calculatePlanAnalytics('fitness');
      analytics = [
        {
          userId,
          weeklyPlanId: weeklyPlan[0].weeklyPlanId,
          activityTitle: 'fitnessPlan',
          numberOfActivities: fitnessAnalytics.numberOfActivities,
          activitiesCompleted: 0,
          pointsGained: 0,
          totalPoints: fitnessAnalytics.totalPoints,
          isActive: true,
          startDate: weeklyPlan[0].dateCreatedFor,
          endDate: weeklyPlan[weeklyPlan.length - 1].dateCreatedFor,
          subtitle: ''
        }
      ];
      break;
    case 'wellness':
      const wellnessAnalytics = calculatePlanAnalytics('wellness');
      analytics = [
        {
          userId,
          weeklyPlanId: weeklyPlan[0].weeklyPlanId,
          activityTitle: 'wellnessPlan',
          numberOfActivities: wellnessAnalytics.numberOfActivities,
          activitiesCompleted: 0,
          pointsGained: 0,
          totalPoints: wellnessAnalytics.totalPoints,
          isActive: true,
          startDate: weeklyPlan[0].dateCreatedFor,
          endDate: weeklyPlan[weeklyPlan.length - 1].dateCreatedFor,
          subtitle: ''
        }
      ];
      break;
  }
  //console.log(weekAnalytics)
  return { week: weeklyPlan, analytics: analytics };
}

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

function generateWeeklyPlans(data, startDate, numberOfDays, userId, options = 'meal') {
  console.log(JSON.stringify(data));
  const mealTitles = ['breakfast', 'midmorning', 'lunch', 'midafternoon', 'dinner'];
  const fitnessTitles = ['warmup', 'strength', 'core', 'cardio', 'cooldown'];
  const wellnessTitles = ['earlymorning', 'morning', 'midday', 'afternoon', 'noontime'];

  // Function to get random item from a list
  const getRandomItem = (items) => items[Math.floor(Math.random() * items.length)];

  // Function to create plan for a given set of titles
  const createPlan = (titles, dataKey, dailyId) =>
    titles.map((title) => ({
      title,
      detail: getRandomItem(data)[title],
      point: Math.floor(Math.random() * 30) + 10,
      isDone: false,
      planDetailId: `${dailyId}-${title}-${Math.floor(Math.random() * 10000)}`
    }));

  // Generate weekly plan
  const weeklyPlanId = uuidv4();
  return Array.from({ length: numberOfDays }, (_, day) => {
    const dailyPlanId = uuidv4();
    let selectedPlan = [];
    let totalPoints = 0;
    // Generate the plan based on the selected option
    if (options === 'meal') {
      selectedPlan = createPlan(mealTitles, 'mealItem', dailyPlanId);
      totalPoints = selectedPlan.reduce((sum, item) => sum + (item.point || 0), 0);
    } else if (options === 'fitness') {
      selectedPlan = createPlan(fitnessTitles, 'fitnessItem', dailyPlanId);
      totalPoints = selectedPlan.reduce((sum, item) => sum + (item.point || 0), 0);
    } else if (options === 'wellness') {
      selectedPlan = createPlan(wellnessTitles, 'wellnessItem', dailyPlanId);
      totalPoints = selectedPlan.reduce((sum, item) => sum + (item.point || 0), 0);
    }

    return {
      userId,
      dailyPlanId,
      weeklyPlanId,
      numberOfActivities: selectedPlan.length,
      activitiesCompleted: 0,
      pointsGained: 0,
      totalPoints,
      [options + 'Plan']: selectedPlan,
      isActive: true,
      dateCreatedFor: startDate.addDays(day),
      [`${options}NumberOfActivities`]: selectedPlan.length,
      [`${options}TotalPoints`]: totalPoints
    };
  });
}

async function get_ai_recommendation(params) {
  let userId = params.userId;
  let data = null;

  switch (params.filter) {
    case 'day':
      if (params.day && params.month && params.year) {
        params.day = `${params.year}-${params.month}-${params.day}`;
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
      if (result) {
        data = {
          ...result,
          id: result.id.toString() // Convert BigInt to string
        };
      }
      break;

    case 'month':
      if (params.month && params.year) {
        const startOfMonth = new Date(params.year, params.month - 1, 1); // month is 1-based, but JavaScript Date is 0-based
        const endOfMonth = new Date(params.year, params.month, 1);

        result = await prisma.userWeeklyRecommendationPlan.findMany({
          where: {
            userId: userId,
            startDate: {
              gte: startOfMonth, // Greater than or equal to the start of the day
              lte: endOfMonth // Less than or equal to the end of the day
            }
          }
        });
        if (result) {
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
      if (params.week) {
        result = await prisma.userRecommendationPlan.findMany({
          where: {
            userId: userId,
            weeklyPlanId: params.week
          },
          select: {
            dateCreatedFor: true,
            dailyPlanId: true,
            weeklyPlanId: true,
            fitnessActivitiesCompleted: true,
            fitnessNumberOfActivities: true,
            fitnessPointsGained: true,
            fitnessTotalPoints: true,
            mealActivitiesCompleted: true,
            mealNumberOfActivities: true,
            mealPointsGained: true,
            mealTotalPoints: true,
            wellnessNumberOfActivities: true,
            wellnessActivitiesCompleted: true,
            wellnessPointsGained: true,
            wellnessTotalPoints: true
          }
        });
        if (result) {
          data = {
            mealPlan: result.map(
              ({
                fitnessActivitiesCompleted,
                fitnessNumberOfActivities,
                fitnessPointsGained,
                fitnessTotalPoints,
                wellnessNumberOfActivities,
                wellnessActivitiesCompleted,
                wellnessTotalPoints,
                wellnessPointsGained,
                ...rest
              }) => rest
            ),
            fitnessPlan: result.map(
              ({
                mealNumberOfActivities,
                mealActivitiesCompleted,
                mealTotalPoints,
                mealPointsGained,
                wellnessNumberOfActivities,
                wellnessActivitiesCompleted,
                wellnessTotalPoints,
                wellnessPointsGained,
                ...rest
              }) => rest
            ),
            wellnessPlan: result.map(
              ({
                mealNumberOfActivities,
                mealActivitiesCompleted,
                mealTotalPoints,
                mealPointsGained,
                fitnessActivitiesCompleted,
                fitnessNumberOfActivities,
                fitnessPointsGained,
                fitnessTotalPoints,
                ...rest
              }) => rest
            )
          };
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
      JSON.stringify(obj, (key, value) => (typeof value === 'bigint' ? value.toString() : value))
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
    let dailyplanId = params.planDetailIds[0].split('-').slice(0, -2).join('-');
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

    plan_item.mealPlan.forEach((element) => {
      if (params.planDetailIds.includes(element.planDetailId)) {
        console.log(element.isDone);
        if (!element.isDone) {
          element.isDone = true;
          plan_item.mealPointsGained += element.point;
          plan_item.mealActivitiesCompleted += 1;
          plan_item.activitiesCompleted += 1;
          plan_item.pointsGained += element.point;
        }
      }
    });

    plan_item.fitnessPlan.forEach((element) => {
      if (params.planDetailIds.includes(element.planDetailId)) {
        if (!element.isDone) {
          element.isDone = true;
          plan_item.fitnessPointsGained += element.point;
          plan_item.fitnessActivitiesCompleted += 1;
          plan_item.activitiesCompleted += 1;
          plan_item.pointsGained += element.point;
        }
      }
    });

    try {
      const updatePlanItem = await prisma.userRecommendationPlan.update({
        where: {
          id: plan_item.id
        },
        data: plan_item
      });

      const weeklyMealPlan = await prisma.userWeeklyRecommendationPlan.update({
        where: {
          user_id: {
            weeklyPlanId: plan_item.weeklyPlanId,
            userId: params.userId,
            activityTitle: 'mealPlan'
          }
        },
        data: {
          activitiesCompleted: plan_item.mealActivitiesCompleted,
          pointsGained: plan_item.pointsGained,
          dateUpdateAt: new Date()
        }
      });

      const weeklyFitnessPlan = await prisma.userWeeklyRecommendationPlan.update({
        where: {
          user_id: {
            weeklyPlanId: plan_item.weeklyPlanId,
            userId: params.userId,
            activityTitle: 'fitnessPlan'
          }
        },
        data: {
          activitiesCompleted: plan_item.mealActivitiesCompleted,
          pointsGained: plan_item.pointsGained,
          dateUpdateAt: new Date()
        }
      });
    } catch (error) {
      console.log(error);
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
