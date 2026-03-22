interface SkillImportance {
  skill: string;
  importance: number;
  reasoning?: string;
}

export async function rankSkillsWithAI(
  jobTitle: string,
  jobDescription: string,
  skills: string[]
): Promise<SkillImportance[]> {
  try {
    console.log('🔍 Ranking skills for:', jobTitle);
    
    const response = await fetch('/api/rank-skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobTitle,
        jobDescription,
        skills,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API error:', error);
      throw new Error(error.error || 'Failed to rank skills');
    }

    const data = await response.json();
    console.log('✅ Received ranked skills:', data.rankedSkills);
    return data.rankedSkills;
  } catch (error) {
    console.error('❌ Error ranking skills:', error);
    // Fallback: return skills with default importance
    return skills.map(skill => ({
      skill,
      importance: 50,
      reasoning: 'Unable to analyze - using default'
    }));
  }
}