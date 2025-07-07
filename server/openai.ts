import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface SyncAnalysis {
  suitability: number; // 1-10 score
  reasoning: string;
  sceneMatches: string[];
  emotionalTones: string[];
  narrativeElements: string[];
  recommendedUsage: string[];
  targetDemographics: string[];
  similarReferences: string[];
  themes: string[]; // Christmas, Mother's Day, Siblings, etc.
  seasonality: string[]; // Holiday, Summer, Back-to-school, etc.
  occasions: string[]; // Wedding, Graduation, Birthday, etc.
}

export interface PitchRecommendation {
  songId: number;
  songTitle: string;
  matchScore: number;
  analysis: SyncAnalysis;
}

export async function analyzeForSync(
  songData: {
    title: string;
    artist: string;
    lyrics?: string;
    genre?: string;
    mood?: string;
    tempo?: number;
    key?: string;
    energy?: string;
    instrumentalDescription?: string;
  },
  projectBrief: {
    title: string;
    description: string;
    targetAudience?: string;
    projectType: string; // TV, Film, Commercial, Game, etc.
    sceneDescription?: string;
    desiredMood?: string;
    targetDemographics?: string;
  }
): Promise<SyncAnalysis> {
  try {
    const prompt = `
You are a music sync licensing expert. Analyze how well this song matches the project brief for sync licensing.

SONG DETAILS:
- Title: ${songData.title}
- Artist: ${songData.artist}
- Genre: ${songData.genre || 'Not specified'}
- Mood: ${songData.mood || 'Not specified'}
- Tempo: ${songData.tempo || 'Not specified'} BPM
- Key: ${songData.key || 'Not specified'}
- Energy: ${songData.energy || 'Not specified'}
- Instrumental Description: ${songData.instrumentalDescription || 'Not specified'}
- Lyrics: ${songData.lyrics || 'Instrumental/No lyrics provided'}

PROJECT BRIEF:
- Project: ${projectBrief.title}
- Type: ${projectBrief.projectType}
- Description: ${projectBrief.description}
- Scene Description: ${projectBrief.sceneDescription || 'Not specified'}
- Target Audience: ${projectBrief.targetAudience || 'Not specified'}
- Desired Mood: ${projectBrief.desiredMood || 'Not specified'}
- Target Demographics: ${projectBrief.targetDemographics || 'Not specified'}

Please provide a comprehensive sync analysis in JSON format with the following structure:
{
  "suitability": <number 1-10>,
  "reasoning": "<detailed explanation of why this song fits or doesn't fit>",
  "sceneMatches": ["<specific scenes this would work well in>"],
  "emotionalTones": ["<emotions this song evokes>"],
  "narrativeElements": ["<story elements the song supports>"],
  "recommendedUsage": ["<how to use this song (background, montage, credits, etc.)>"],
  "targetDemographics": ["<which demographics this appeals to>"],
  "similarReferences": ["<similar songs or artists that have worked in sync>"],
  "themes": ["<specific themes like Christmas, Mother's Day, Siblings, Family, Romance, etc.>"],
  "seasonality": ["<seasonal relevance like Holiday, Summer, Back-to-school, Spring, etc.>"],
  "occasions": ["<special occasions like Wedding, Graduation, Birthday, Anniversary, etc.>"]
}

Focus on:
- Lyrical content and themes (including specific themes like Christmas, Mother's Day, Siblings, Family, Romance, Friendship, etc.)
- Musical characteristics (tempo, energy, instrumentation)
- Emotional impact and mood
- Scene compatibility
- Audience appeal
- Industry trends and successful sync examples
- Seasonal relevance (Holiday, Summer, Back-to-school, Spring, etc.)
- Special occasions (Wedding, Graduation, Birthday, Anniversary, etc.)
- Universal themes vs. niche appeal
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert music supervisor with 20+ years of experience in sync licensing. Provide detailed, actionable analysis for sync opportunities."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      suitability: analysis.suitability || 0,
      reasoning: analysis.reasoning || '',
      sceneMatches: analysis.sceneMatches || [],
      emotionalTones: analysis.emotionalTones || [],
      narrativeElements: analysis.narrativeElements || [],
      recommendedUsage: analysis.recommendedUsage || [],
      targetDemographics: analysis.targetDemographics || [],
      similarReferences: analysis.similarReferences || [],
      themes: analysis.themes || [],
      seasonality: analysis.seasonality || [],
      occasions: analysis.occasions || []
    };

  } catch (error) {
    console.error('Error analyzing sync potential:', error);
    throw new Error('Failed to analyze sync potential: ' + (error as Error).message);
  }
}

export async function generatePitchRecommendations(
  songs: Array<{
    id: number;
    title: string;
    artist: string;
    lyrics?: string;
    genre?: string;
    mood?: string;
    tempo?: number;
    key?: string;
    energy?: string;
    instrumentalDescription?: string;
  }>,
  projectBrief: {
    title: string;
    description: string;
    targetAudience?: string;
    projectType: string;
    sceneDescription?: string;
    desiredMood?: string;
    targetDemographics?: string;
  }
): Promise<PitchRecommendation[]> {
  const recommendations: PitchRecommendation[] = [];

  for (const song of songs) {
    try {
      const analysis = await analyzeForSync(song, projectBrief);
      
      recommendations.push({
        songId: song.id,
        songTitle: song.title,
        matchScore: analysis.suitability,
        analysis
      });
    } catch (error) {
      console.error(`Error analyzing song ${song.title}:`, error);
      // Continue with other songs even if one fails
    }
  }

  // Sort by match score (highest first)
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

export async function analyzeLyrics(lyrics: string): Promise<{
  themes: string[];
  emotions: string[];
  narrative: string;
  marketability: number;
  syncPotential: string[];
}> {
  try {
    const prompt = `
Analyze these song lyrics for sync licensing potential:

LYRICS:
${lyrics}

Please provide analysis in JSON format:
{
  "themes": ["<main themes in the lyrics>"],
  "emotions": ["<emotional tones present>"],
  "narrative": "<brief description of the story/narrative>",
  "marketability": <number 1-10 for commercial appeal>,
  "syncPotential": ["<types of media/scenes this would work well in>"]
}

Focus on:
- Commercial viability
- Emotional resonance
- Narrative coherence
- Brand safety
- Universal vs. niche appeal
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a music industry expert specializing in sync licensing and commercial music placement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      themes: analysis.themes || [],
      emotions: analysis.emotions || [],
      narrative: analysis.narrative || '',
      marketability: analysis.marketability || 0,
      syncPotential: analysis.syncPotential || []
    };

  } catch (error) {
    console.error('Error analyzing lyrics:', error);
    throw new Error('Failed to analyze lyrics: ' + (error as Error).message);
  }
}

export async function generateContractFromTemplate(
  dealData: {
    songTitle: string;
    artist: string;
    licenseType: string;
    territory: string;
    term: string;
    fee: number;
    usage: string;
    clientName: string;
    projectTitle: string;
  },
  templateType: string = 'standard'
): Promise<string> {
  try {
    const prompt = `
Generate a professional sync licensing contract based on this information:

DEAL DETAILS:
- Song: "${dealData.songTitle}" by ${dealData.artist}
- License Type: ${dealData.licenseType}
- Territory: ${dealData.territory}
- Term: ${dealData.term}
- Fee: $${dealData.fee}
- Usage: ${dealData.usage}
- Client: ${dealData.clientName}
- Project: ${dealData.projectTitle}
- Template Type: ${templateType}

Generate a comprehensive sync licensing agreement that includes:
- Parties and definitions
- Grant of rights
- Territory and term
- Compensation
- Usage restrictions
- Delivery requirements
- Warranties and representations
- Termination clauses

Make it professional and industry-standard while being clear and readable.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a music industry lawyer specializing in sync licensing contracts. Generate professional, legally sound agreements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3 // Lower temperature for more consistent legal language
    });

    return response.choices[0].message.content || '';

  } catch (error) {
    console.error('Error generating contract:', error);
    throw new Error('Failed to generate contract: ' + (error as Error).message);
  }
}