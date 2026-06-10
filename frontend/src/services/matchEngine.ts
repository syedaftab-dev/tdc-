import { Client, Profile, MatchScoreResult } from '../types';

// Deterministic Guna Milan score based on Nakshatra combinations
function calculateGunaMilan(n1: string, n2: string): number {
  if (n1 === 'N/A' || n2 === 'N/A') return 24; // Average score if not Hindu or astrology not tracked
  
  // Deterministic value between 12 and 36 based on string characters
  let charSum = 0;
  for (let i = 0; i < n1.length; i++) charSum += n1.charCodeAt(i);
  for (let i = 0; i < n2.length; i++) charSum += n2.charCodeAt(i);
  
  return 18 + (charSum % 19); // Generates a number between 18 and 36
}

export function calculateMatchScore(client: Client, candidate: Profile): MatchScoreResult {
  const reasons: string[] = [];
  const redFlags: string[] = [];
  
  // Breakdown scores (each out of 10)
  let ageComp = 10;
  let incomeComp = 10;
  let heightComp = 10;
  let locationComp = 10;
  let culturalComp = 10;
  let lifestyleComp = 10;
  let educationComp = 10;
  let astrologyComp = 10;
  
  // ----------------------------------------------------
  // GENDER-SPECIFIC LOGIC
  // ----------------------------------------------------
  if (client.gender === 'Male') {
    // 1. Younger: Women who are younger
    const ageDiff = client.age - candidate.age;
    if (ageDiff <= 0) {
      // Not younger
      ageComp = Math.max(2, 6 + ageDiff); // penalize if same age or older
      redFlags.push(`Candidate is not younger (${candidate.age} vs client's ${client.age})`);
    } else if (ageDiff >= 1 && ageDiff <= 5) {
      ageComp = 10; // ideal age difference
      reasons.push(`Candidate is in the ideal younger bracket (${ageDiff} years younger)`);
    } else {
      ageComp = 8; // a bit too young
      reasons.push(`Candidate is significantly younger (${ageDiff} years younger)`);
    }

    // 2. Earn less: Women who earn less
    if (candidate.income >= client.income) {
      incomeComp = 4;
      redFlags.push(`Candidate earns equal or more than the client (${candidate.income} LPA vs ${client.income} LPA)`);
    } else {
      incomeComp = 10;
      reasons.push(`Income aligns with traditional preferences (candidate earns less: ${candidate.income} LPA vs ${client.income} LPA)`);
    }

    // 3. Shorter: Women who are shorter
    if (candidate.heightCm >= client.heightCm) {
      heightComp = 3;
      redFlags.push(`Candidate is taller or equal height (${candidate.height} vs ${client.height})`);
    } else {
      heightComp = 10;
      reasons.push(`Height matches traditional preference (candidate is shorter: ${candidate.height} vs ${client.height})`);
    }

    // 4. Matching views on children
    if (client.wantKids === candidate.wantKids) {
      lifestyleComp += 10; // Extra bonus, cap later
      reasons.push(`Perfect agreement on having children (${client.wantKids})`);
    } else if (
      (client.wantKids === 'Maybe' || candidate.wantKids === 'Maybe')
    ) {
      lifestyleComp += 5;
    } else {
      lifestyleComp -= 8;
      redFlags.push(`Conflicting views on having children (Client: ${client.wantKids}, Candidate: ${candidate.wantKids})`);
    }
  } else {
    // Client is Female
    // 1. Compatibility on profession & status (e.g. SDE/Consultant matching well with corporate, doctors with doctors)
    const clientOccupation = client.designation.toLowerCase();
    const candidateOccupation = candidate.designation.toLowerCase();
    const isClientDoctor = clientOccupation.includes('doctor') || clientOccupation.includes('pediatrician') || clientOccupation.includes('mbbs') || client.degree.includes('MBBS') || client.degree.includes('MD');
    const isCandidateDoctor = candidateOccupation.includes('doctor') || candidateOccupation.includes('pediatrician') || candidateOccupation.includes('mbbs') || candidate.degree.includes('MBBS') || candidate.degree.includes('MD');

    if (isClientDoctor && isCandidateDoctor) {
      educationComp = 10;
      reasons.push('Highly compatible: Both are medical professionals');
    } else if (isClientDoctor && !isCandidateDoctor) {
      educationComp = 5;
      redFlags.push('Professional mismatch: Client is a doctor, candidate is in a different profession');
    } else {
      // Corporate alignments
      const corporateDesignations = ['consultant', 'manager', 'director', 'engineer', 'analyst', 'architect', 'scientist'];
      const clientCorporate = corporateDesignations.some(d => clientOccupation.includes(d));
      const candidateCorporate = corporateDesignations.some(d => candidateOccupation.includes(d));
      
      if (clientCorporate && candidateCorporate) {
        educationComp = 10;
        reasons.push(`Strong corporate alignment (${client.designation} & ${candidate.designation})`);
      } else {
        educationComp = 7;
      }
    }

    // Income compatibility for female client (prefers male earning equal or more)
    if (candidate.income >= client.income) {
      incomeComp = 10;
      reasons.push(`Candidate has strong financial stability (${candidate.income} LPA)`);
    } else {
      incomeComp = 5;
      redFlags.push(`Candidate earns less than the client (${candidate.income} LPA vs ${client.income} LPA)`);
    }

    // 2. Values compatibility
    if (client.familyValues === candidate.familyValues) {
      culturalComp = 10;
      reasons.push(`Perfect family values alignment (${client.familyValues} values)`);
    } else if (
      (client.familyValues === 'Liberal' && candidate.familyValues === 'Traditional') ||
      (client.familyValues === 'Traditional' && candidate.familyValues === 'Liberal')
    ) {
      culturalComp = 3;
      redFlags.push(`Significant values conflict (Client: ${client.familyValues}, Candidate: ${candidate.familyValues})`);
    } else {
      culturalComp = 7;
      reasons.push(`Moderate values compatibility (Client: ${client.familyValues}, Candidate: ${candidate.familyValues})`);
    }

    // 3. Relocation preferences
    // If client openToRelocate is 'No', candidate must be in same city.
    if (client.openToRelocate === 'No' && client.city !== candidate.city) {
      locationComp = 2;
      redFlags.push(`Location mismatch: Client is not open to relocating outside ${client.city}, candidate is in ${candidate.city}`);
    } else if (client.city === candidate.city) {
      locationComp = 10;
      reasons.push(`Both reside in the same city (${client.city})`);
    } else if (client.openToRelocate === 'Yes' || candidate.openToRelocate === 'Yes') {
      locationComp = 8;
      reasons.push(`Different cities (${client.city} vs ${candidate.city}) but open to relocation`);
    } else {
      locationComp = 4;
      redFlags.push(`Different cities (${client.city} vs ${candidate.city}) and hesitant to relocate`);
    }
  }

  // ----------------------------------------------------
  // GENERAL MATCHING LOGIC (INDIAN MATCHMAKING CONTEXT)
  // ----------------------------------------------------

  // 1. Location (if not already handled fully above)
  if (client.city === candidate.city) {
    if (locationComp < 10) locationComp = 10;
    if (!reasons.includes(`Both reside in the same city (${client.city})`)) {
      reasons.push(`Convenient local match: Both are in ${client.city}`);
    }
  }

  // 2. Religion & Caste
  if (client.religion === candidate.religion) {
    culturalComp = Math.min(10, culturalComp + 2);
    reasons.push(`Religious alignment: Both are ${client.religion}`);
    
    if (client.caste === candidate.caste) {
      culturalComp = 10;
      reasons.push(`Community match: Same caste/community (${client.caste})`);
    } else {
      // If caste differs and values are Traditional
      if (client.familyValues === 'Traditional') {
        culturalComp = Math.max(3, culturalComp - 3);
        redFlags.push(`Caste difference (${client.caste} vs ${candidate.caste}) in a traditional family setting`);
      }
    }
  } else {
    culturalComp = Math.max(2, culturalComp - 5);
    redFlags.push(`Different religions (Client: ${client.religion}, Candidate: ${candidate.religion})`);
  }

  // 3. Diet
  if (client.diet === candidate.diet) {
    lifestyleComp = Math.min(10, lifestyleComp + 1);
    reasons.push(`Shared dietary habits: Both are ${client.diet}`);
  } else {
    if (client.diet === 'Veg' && candidate.diet !== 'Veg' && candidate.diet !== 'Jain') {
      lifestyleComp = Math.max(2, lifestyleComp - 4);
      redFlags.push(`Dietary mismatch: Client is ${client.diet}, candidate is ${candidate.diet}`);
    } else if (client.diet === 'Jain' && candidate.diet !== 'Jain') {
      lifestyleComp = Math.max(1, lifestyleComp - 5);
      redFlags.push(`Dietary mismatch: Client has strict Jain diet, candidate is ${candidate.diet}`);
    }
  }

  // 4. Smoking & Drinking Habits
  if (client.smoke === 'No' && candidate.smoke === 'Yes') {
    lifestyleComp = Math.max(2, lifestyleComp - 3);
    redFlags.push('Habits mismatch: Client does not smoke, candidate smokes');
  }
  if (client.drink === 'No' && candidate.drink === 'Yes') {
    lifestyleComp = Math.max(3, lifestyleComp - 2);
    redFlags.push('Habits mismatch: Client does not drink, candidate drinks');
  }

  // 5. Horoscope / Kundali Match
  if (client.religion === 'Hindu' && candidate.religion === 'Hindu') {
    const gunaMilanScore = calculateGunaMilan(client.nakshatra, candidate.nakshatra);
    
    if (client.horoscopeImportance === 'High') {
      if (gunaMilanScore >= 25) {
        astrologyComp = 10;
        reasons.push(`Excellent Horoscope match (Guna Milan: ${gunaMilanScore}/36)`);
      } else if (gunaMilanScore >= 18) {
        astrologyComp = 8;
        reasons.push(`Good Horoscope match (Guna Milan: ${gunaMilanScore}/36)`);
      } else {
        astrologyComp = 3;
        redFlags.push(`Low Horoscope match (Guna Milan: ${gunaMilanScore}/36) for a family with high horoscope importance`);
      }
      
      // Manglik check
      if (client.manglikStatus === 'Yes' && candidate.manglikStatus === 'No') {
        astrologyComp = Math.max(2, astrologyComp - 4);
        redFlags.push('Manglik mismatch: Client is Manglik, candidate is Non-Manglik');
      } else if (client.manglikStatus === 'No' && candidate.manglikStatus === 'Yes') {
        astrologyComp = Math.max(2, astrologyComp - 4);
        redFlags.push('Manglik mismatch: Client is Non-Manglik, candidate is Manglik');
      } else if (client.manglikStatus === 'Yes' && candidate.manglikStatus === 'Yes') {
        astrologyComp = 10;
        reasons.push('Astrologically aligned: Both are Manglik (cancellation of Dosha)');
      }
    } else {
      astrologyComp = 9;
      if (gunaMilanScore >= 18) {
        reasons.push(`Astrological compatibility: Guna Milan is favorable (${gunaMilanScore}/36)`);
      }
    }
  } else {
    astrologyComp = 10; // Astrology not relevant for other religions, auto-perfect compatibility
  }

  // General Age Range (irrespective of gender, just standard check)
  const absoluteAgeDiff = Math.abs(client.age - candidate.age);
  if (absoluteAgeDiff > 6) {
    if (ageComp > 5) ageComp = 5;
    redFlags.push(`Significant age difference (${absoluteAgeDiff} years gap)`);
  }

  // ----------------------------------------------------
  // TOTAL COMPATIBILITY SCORE CALCULATION
  // ----------------------------------------------------
  // Clamp all breakdown scores between 1 and 10
  const clamp = (v: number) => Math.max(1, Math.min(10, v));
  
  const finalBreakdown = {
    ageCompatibility: clamp(ageComp),
    incomeCompatibility: clamp(incomeComp),
    heightCompatibility: clamp(heightComp),
    locationCompatibility: clamp(locationComp),
    culturalCompatibility: clamp(culturalComp),
    lifestyleCompatibility: clamp(lifestyleComp),
    educationCompatibility: clamp(educationComp),
    astrologyCompatibility: clamp(astrologyComp),
  };

  // Weight breakdown
  const weights = {
    ageCompatibility: 0.15,
    incomeCompatibility: 0.15,
    heightCompatibility: 0.05,
    locationCompatibility: 0.15,
    culturalCompatibility: 0.15,
    lifestyleCompatibility: 0.15,
    educationCompatibility: 0.10,
    astrologyCompatibility: 0.10,
  };

  const weightedSum = 
    finalBreakdown.ageCompatibility * weights.ageCompatibility +
    finalBreakdown.incomeCompatibility * weights.incomeCompatibility +
    finalBreakdown.heightCompatibility * weights.heightCompatibility +
    finalBreakdown.locationCompatibility * weights.locationCompatibility +
    finalBreakdown.culturalCompatibility * weights.culturalCompatibility +
    finalBreakdown.lifestyleCompatibility * weights.lifestyleCompatibility +
    finalBreakdown.educationCompatibility * weights.educationCompatibility +
    finalBreakdown.astrologyCompatibility * weights.astrologyCompatibility;

  // Convert to 0-100 score
  let score = Math.round(weightedSum * 10);
  
  // Severe Red Flag Penalty
  if (redFlags.length >= 3) {
    score = Math.max(20, score - 15);
  }
  
  // Cap at 99% (no one is a 100% perfect match, adds realism!)
  score = Math.min(99, score);

  return {
    score,
    breakdown: finalBreakdown,
    reasons,
    redFlags
  };
}
