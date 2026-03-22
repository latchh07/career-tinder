import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, jobDescription, skills } = await request.json();

    if (!skills || skills.length === 0) {
      return NextResponse.json(
        { error: 'No skills provided' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert recruiter analyzing a job posting. 

Job Title: ${jobTitle}

Job Description:
${jobDescription || 'No description provided'}

Skills to evaluate: ${skills.join(', ')}

For each skill, determine how important it is for this specific role based on the job description. Rate each skill from 0-100 where:
- 90-100: Critical/Must-have skill, mentioned multiple times or heavily emphasized
- 70-89: Very important, clearly mentioned as a key requirement
- 50-69: Important, mentioned but not absolutely critical
- 30-49: Nice to have, mentioned briefly or implied
- 0-29: Barely relevant or not mentioned in the description

Respond with ONLY a valid JSON array in this exact format (no markdown, no code blocks):
[
  {"skill": "Java", "importance": 95, "reasoning": "Core language for backend development, mentioned 3 times"},
  {"skill": "Machine Learning", "importance": 60, "reasoning": "Mentioned for data analysis tasks but not primary focus"}
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes job descriptions and ranks skill importance. Always respond with valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Clean up the response (remove markdown code blocks if present)
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '');
    }
    
    // Parse the JSON response
    const rankedSkills = JSON.parse(cleanedContent);

    console.log('✅ Skills ranked successfully:', rankedSkills);

    return NextResponse.json({ rankedSkills });
  } catch (error: any) {
    console.error('❌ Error in rank-skills API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze skills', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}