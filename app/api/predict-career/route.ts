// app/api/predict-career/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, jobRequirements, userProfile } = await req.json();

    const currentMatch = userProfile.currentMatchScore || 70; // Use provided score or default

    const prompt = `You are a career advisor AI analyzing a candidate's career trajectory.

Job Title: ${jobTitle}
Required Skills: ${jobRequirements.skills.join(', ')}
Required Qualifications: ${jobRequirements.qualifications.join(', ')}

Candidate Profile:
- Current Year: ${userProfile.year}
- Current Skills: ${userProfile.skills.join(', ')}
- Certifications: ${userProfile.certifications?.join(', ') || 'None'}
- Current Match Score: ${currentMatch}%

CRITICAL: The candidate's EXACT current match score is ${currentMatch}%. You MUST use ${currentMatch} as the matchPercentage for Year 0 in your timeline.

Analyze this candidate's career trajectory over 5 years if they DON'T upskill. Consider:
1. The current match is ${currentMatch}% - use this EXACT value for Year 0
2. How will market demands change in 5 years for this role?
3. What skills will become obsolete or less relevant?
4. What new skills will this role require in the future?
5. How will AI, automation, and industry trends affect this role?

Be realistic - if they don't upskill, their match percentage will likely DECREASE over time due to:
- Emerging technologies making current skills less valuable
- New requirements being added to the role
- Market standards evolving faster than static skillsets

Respond ONLY with valid JSON in this exact format (no markdown, no backticks, no extra text):
{
  "currentMatch": ${currentMatch},
  "futureMatch": 25,
  "skillGaps": ["Advanced Python", "Machine Learning", "Cloud Computing"],
  "recommendations": [
    {
      "course": "Machine Learning Specialization",
      "platform": "Coursera",
      "reason": "This role increasingly requires ML skills for data analysis and prediction"
    },
    {
      "course": "AWS Cloud Practitioner",
      "platform": "AWS Training",
      "reason": "Cloud infrastructure knowledge is becoming essential for modern data roles"
    },
    {
      "course": "Advanced SQL & Database Design",
      "platform": "Udemy",
      "reason": "Database complexity is growing; advanced SQL skills will maintain relevance"
    }
  ],
  "timeline": [
    {
      "year": 0,
      "matchPercentage": ${currentMatch},
      "keyMilestone": "Strong foundation with current Python and SQL skills"
    },
    {
      "year": 1,
      "matchPercentage": 65,
      "keyMilestone": "Emerging need for advanced cloud and edge computing skills"
    },
    {
      "year": 2,
      "matchPercentage": 50,
      "keyMilestone": "Growing gap as ML and containerization become standard"
    },
    {
      "year": 3,
      "matchPercentage": 40,
      "keyMilestone": "Increased reliance on cloud computing and cybersecurity measures"
    },
    {
      "year": 5,
      "matchPercentage": 25,
      "keyMilestone": "Significantly behind without ML, cloud, edge computing, and containerization skills"
    }
  ]
}

IMPORTANT RULES:
- timeline MUST have exactly 5 entries for years 0, 1, 2, 3, and 5
- Year 0 matchPercentage MUST be ${currentMatch}
- Percentages should gradually decrease from Year 0 to Year 5
- futureMatch should equal the Year 5 matchPercentage
- Make the degradation realistic (typically 30-60% decrease over 5 years)`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a career prediction AI with expertise in job market trends, technology evolution, and skill deprecation. Always respond with valid JSON only, no other text. Be realistic and data-driven in your predictions. The timeline MUST have exactly 5 entries for years 0, 1, 2, 3, and 5. Year 0 must use the exact currentMatch value provided.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content || '{}';
    
    // Parse the JSON response
    let prediction;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      prediction = JSON.parse(cleanedResponse);
      
      // Ensure currentMatch matches what we sent
      prediction.currentMatch = currentMatch;
      
      // Ensure Year 0 in timeline matches currentMatch
      if (prediction.timeline && prediction.timeline[0]) {
        prediction.timeline[0].matchPercentage = currentMatch;
      }
      
      // Validate the response has required fields
      if (!prediction.futureMatch || !prediction.timeline || prediction.timeline.length !== 5) {
        console.error('Invalid timeline length:', prediction.timeline?.length);
        throw new Error('Invalid prediction structure - timeline must have 5 entries');
      }
      
      // Validate timeline has correct years
      const expectedYears = [0, 1, 2, 3, 5];
      const actualYears = prediction.timeline.map((t: any) => t.year);
      const hasCorrectYears = expectedYears.every((y, i) => actualYears[i] === y);
      
      if (!hasCorrectYears) {
        console.error('Timeline has incorrect years:', actualYears);
        throw new Error('Timeline must have years 0, 1, 2, 3, 5');
      }
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Invalid response format from AI');
    }

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}