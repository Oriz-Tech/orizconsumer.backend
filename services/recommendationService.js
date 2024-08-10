const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getCurrentDateUtc } = require("../common/helpers/dateTimeHelper")
const { v4: uuidv4 } = require('uuid');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generate_plan(params){
    let userId = params.userId
    let currentDate = getCurrentDateUtc().toISOString().slice(0, 19).replace('T', ' ');
    let medicalCondition = "has no medical condition"
    let dietaryRestriction = "has no dietary restriction"

    if(params.hasMedicationCondition == true){
        medicalCondition = "has a "+params.medicalCondition;
    }

    if(params.hasDietaryRestriction == true){
        dietaryRestriction = "is " + params.dietaryRestriction
    }

    let planCorrelationId = uuidv4()
    let prompt = `Generate a meal and fitness plan for someone 
    who is ${params.typeOfWork} +"and works as a ${params.occupation}. He is an ${params.dailyRoutine} who does not go to gym, 
    looking to ${params.weightGoal} and ${medicalCondition}. His body weight is ${params.weight} and height of  ${params.height}  
    ${params.enjoyedActivity} and willing to coming ${params.daysPerWeek} days a week of ${params.hoursPerDayForFitness} hours per day to a fitness goal
    and ${dietaryRestriction}. He gets ${params.sleepingHours} hours of sleep per night using this JSON Schema: 
    {   
        "type": "object",
        "properties": {
            "day": { "type": "string" },
            "mealPlan": { "type": "string" },
            "fitnessPlan":{ "type": "string" },
            "isDone": {"type":"boolean"},
            "userId": ${userId},
            "planCorrelationId": ${planCorrelationId}
        }
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let startIndex = text.indexOf('[');
    let endIndex = text.lastIndexOf(']');
    let jsonContent = text.substring(startIndex, endIndex+1).trim();

    let data = JSON.parse(jsonContent)
    const addedResult = await prisma.userPlan.createMany({
        data:data
    })

    //save request 
    let request = {
        "typeOfWork":params.typeOfWork,
        "occupation":params.occupation,
        "dailyRoutine": params.dailyRoutine,
        "weightGoal":params.weightGoal,
        "hasMedicationCondition": params.hasMedicationCondition, 
        "medicalCondition":params.medicalCondition,
        "hasDietaryRestriction":params.hasDietaryRestriction,
        "dietaryRestriction": params.dietaryRestriction,
        "weight":params.weight,
        "height":params.height,
        "enjoyedActivity": params.enjoyedActivity,
        "daysPerWeek": params.daysPerWeek,
        "hoursPerDay":params.hoursPerDayForFitness,
        "sleepingHours":params.sleepingHours,
        "userId": userId,
        "planCorrelationId": planCorrelationId
    }

    const requestResult = await prisma.userPlanSettings.create({
        data: request
    })


    return {
        status: 200,
        message: 'Success',
        code: 'S00',
        data:  data
      };
}

module.exports = {
    generate_plan
}