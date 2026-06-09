import { Client, Profile, MatchScoreResult } from '../types/index.js';

interface AICompatibilityResult {
  analysis: string;
}

interface AIPitchResult {
  pitch: string;
}

// Helper to check for API key in environment
function getApiKey(): string {
  return process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || '';
}

function getAiProvider(apiKey: string): { url: string; model: string; providerName: string } {
  // Groq API keys start with "gsk_" or match environment variable
  if (apiKey.startsWith('gsk_') || (apiKey === process.env.GROQ_API_KEY && process.env.GROQ_API_KEY)) {
    return {
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
      providerName: 'Groq',
    };
  }
  return {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    providerName: 'OpenAI',
  };
}

export async function fetchAICompatibility(
  client: Client,
  candidate: Profile,
  matchResult: MatchScoreResult,
  userApiKey?: string
): Promise<AICompatibilityResult> {
  const apiKey = userApiKey || getApiKey();
  
  if (!apiKey) {
    // Return mock response after delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const alignment = matchResult.score >= 80 ? 'EXCELLENT' : matchResult.score >= 60 ? 'STRONG' : 'MODERATE';
    
    return {
      analysis: `**AI Compatibility Assessment: ${alignment} ALIGNMENT (${matchResult.score}% Match Score)**

We have analyzed the profiles of ${client.firstName} (${client.gender}) and ${candidate.firstName} (${candidate.gender}) across 8 structural compatibility vectors. Here is the AI matchmaker assessment:

**Key Strengths:**
- **Socio-Cultural Match:** Both are of the ${client.religion} faith, which provides a cohesive foundation for family traditions and rituals.
- **Lifestyle Synced:** Shared alignment on diet (${client.diet}) and lifestyle habits. They are highly compatible in daily routines.
- **Financial & Status Security:** Income alignment matches traditional search filters. ${client.firstName} (${client.income} LPA) and ${candidate.firstName} (${candidate.income} LPA) are in compatible professional brackets.

**Potential Red Flags & Risk Areas:**
- **Astrology Check:** Guna Milan score is ${matchResult.score >= 70 ? 'favorable' : 'moderate'}. ${client.horoscopeImportance === 'High' ? 'Since horoscope matching is of High importance, a detailed Kundali verification is suggested.' : 'Horoscope matching is of low concern for this client.'}
- **Geography:** ${client.city === candidate.city ? 'Excellent local match, both in ' + client.city : 'They reside in different cities (' + client.city + ' vs ' + candidate.city + '), relocation feasibility needs discussion.'}

**Matchmaker Verdict:** Recommended for immediate pitch. The profiles show high alignment on core values, and they both appreciate ambitious, family-oriented careers.`,
    };
  }

  try {
    const prompt = `You are a Senior Matchmaker for "The Date Crew" (TDC), a premium boutique dating and matrimonial service.
Evaluate the compatibility between our Client and a Potential Match Candidate based on their detailed profiles and our algorithms alignment score.

Client Profile:
- Name: ${client.firstName} ${client.lastName}
- Gender: ${client.gender}
- Age: ${client.age}
- Height: ${client.height}
- City: ${client.city}
- Religion/Caste: ${client.religion} / ${client.caste}
- Income: ${client.income} LPA
- Diet: ${client.diet}
- Profession: ${client.designation} at ${client.currentCompany}
- About: ${client.aboutMe}

Candidate Profile:
- Name: ${candidate.firstName} ${candidate.lastName}
- Gender: ${candidate.gender}
- Age: ${candidate.age}
- Height: ${candidate.height}
- City: ${candidate.city}
- Religion/Caste: ${candidate.religion} / ${candidate.caste}
- Income: ${candidate.income} LPA
- Diet: ${candidate.diet}
- Profession: ${candidate.designation} at ${candidate.currentCompany}
- About: ${candidate.aboutMe}

Algorithm Compatibility Match Score: ${matchResult.score}%
Key match reasons: ${matchResult.reasons.join(', ')}
Red flags flagged by algorithm: ${matchResult.redFlags.join(', ')}

Please write a structured Matchmaker compatibility review in markdown with three sections:
1. **AI Compatibility Assessment** (summarize overall alignment score and structural fit)
2. **Key Strengths:** (list 2-3 bullets of why they match well culturally, professionally, and in lifestyle)
3. **Potential Red Flags / Risk Areas:** (list 1-2 bullets of potential friction points, e.g. age difference, relocation issues, or dietary differences)
4. **Matchmaker Verdict** (1-2 sentences summarizing if the matchmaker should send the pitch)

Keep the tone professional, insightful, and focused on Indian matrimonial compatibility factors (lifestyle, location, career, and family alignment). Do not include any JSON wrapper, return only the raw markdown text.`;

    const provider = getAiProvider(apiKey);

    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`${provider.providerName} API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content || 'Could not generate analysis.';
    return { analysis };
  } catch (error: any) {
    console.error('Error fetching AI compatibility from server:', error);
    throw error;
  }
}

export async function fetchAIPitchEmail(
  client: Client,
  candidate: Profile,
  matchResult: MatchScoreResult,
  userApiKey?: string
): Promise<AIPitchResult> {
  const apiKey = userApiKey || getApiKey();

  if (!apiKey) {
    // Return mock response after delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      pitch: `Subject: Curated Match Proposal: ${candidate.firstName} (${candidate.designation})

Dear ${client.firstName},

I hope you are doing well!

Based on your preferences, I have selected a highly aligned profile from our verified pool for you to review. 

Meet ${candidate.firstName}. She is a ${candidate.age}-year-old ${candidate.designation} currently working at ${candidate.currentCompany} in ${candidate.city}. She earns ${candidate.income} LPA and shares your ${client.diet === 'Veg' ? 'Vegetarian' : 'lifestyle'} habits. 

What makes this match particularly compelling is:
- **Shared Cultural Foundation**: Both of you come from similar ${client.religion} backgrounds.
- **Educational & Professional Alignment**: High level of career synergy.
- **Lifestyle Alignment**: Agreement on diet (${client.diet}) and lifestyle values.

Please let me know if you would like me to share ${candidate.firstName}'s full biodata with you and coordinate an initial virtual meeting.

Warm regards,
Karan Johar
Senior Matchmaker, The Date Crew`,
    };
  }

  try {
    const prompt = `You are a Senior Matchmaker for "The Date Crew" (TDC).
Draft a personalized pitch email from the matchmaker to our client proposing a candidate.

Client Info:
- Name: ${client.firstName}
- Gender: ${client.gender}
- Age: ${client.age}
- City: ${client.city}
- Preferred Diet: ${client.diet}

Potential Match Candidate Info:
- Name: ${candidate.firstName}
- Gender: ${candidate.gender}
- Age: ${candidate.age}
- Height: ${candidate.height}
- City: ${candidate.city}
- Profession: ${candidate.designation} at ${candidate.currentCompany}
- Income: ${candidate.income} LPA
- Diet: ${candidate.diet}

Match Score: ${matchResult.score}%
Key match reasons: ${matchResult.reasons.join(', ')}

Please write a highly polished, warm, and professional email draft. Address the client by name (e.g. "Dear ${client.firstName}"). Introduce the candidate by first name, highlighting their age, profession, company, city, and income. Outline 2 compelling reasons why you curated this specific match (e.g. career alignment, lifestyle, shared city, or cultural background). End with a clear call-to-action asking if they'd like to review the full biodata or schedule a call.

Write only the email text with a "Subject:" line at the very top. Keep the tone warm, premium, and advisory. Use "Karan Johar, Senior Matchmaker" in the signature.`;

    const provider = getAiProvider(apiKey);

    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`${provider.providerName} API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const pitch = data.choices[0].message.content || 'Could not generate email draft.';
    return { pitch };
  } catch (error: any) {
    console.error('Error fetching AI email pitch from server:', error);
    throw error;
  }
}
