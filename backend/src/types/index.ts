export type Gender = 'Male' | 'Female';
export type RelocationPreference = 'Yes' | 'No' | 'Maybe';
export type KidsPreference = 'Yes' | 'No' | 'Maybe';
export type PetsPreference = 'Yes' | 'No' | 'Maybe';
export type DietPreference = 'Veg' | 'Non-Veg' | 'Eggetarian' | 'Jain' | 'Vegan';
export type FamilyValues = 'Traditional' | 'Moderate' | 'Liberal';
export type FamilyType = 'Nuclear' | 'Joint';
export type FamilyStatus = 'Middle Class' | 'Upper Middle Class' | 'Rich' | 'Affluent';
export type ManglikStatus = 'Yes' | 'No' | 'Partial' | 'Dont Know';
export type HoroscopeImportance = 'High' | 'Medium' | 'Low';
export type Habits = 'Yes' | 'No' | 'Occasionally';

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string;
  age: number;
  country: string;
  city: string;
  height: string;
  heightCm: number;
  email: string;
  phone: string;
  
  // Education & Career
  undergradCollege: string;
  degree: string;
  income: number; // In Lakhs Per Annum (LPA)
  currentCompany: string;
  designation: string;
  
  // Family Details
  maritalStatus: 'Never Married' | 'Divorced' | 'Widowed' | 'Awaiting Divorce';
  languagesKnown: string[];
  siblings: string;
  familyValues: FamilyValues;
  familyType: FamilyType;
  familyStatus: FamilyStatus;
  fatherOccupation: string;
  motherOccupation: string;
  
  // Cultural & Astrology
  religion: 'Hindu' | 'Muslim' | 'Sikh' | 'Christian' | 'Jain' | 'Buddhist' | 'Other';
  caste: string;
  gothra: string;
  nakshatra: string;
  rashi: string;
  manglikStatus: ManglikStatus;
  horoscopeImportance: HoroscopeImportance;
  
  // Lifestyle Preferences
  wantKids: KidsPreference;
  openToRelocate: RelocationPreference;
  openToPets: PetsPreference;
  diet: DietPreference;
  smoke: Habits;
  drink: Habits;
  
  // Bio / Self-description
  aboutMe: string;
  hobbies: string[];
}

export interface Client extends Profile {
  assignedMatchmaker: string;
  status: 'New' | 'Active Search' | 'Sent Matches' | 'Meeting Stage' | 'On Hold' | 'Matched';
  notes: ClientNote[];
  matchHistory: MatchHistoryItem[];
}

export interface ClientNote {
  id: string;
  timestamp: string;
  author: string;
  text: string;
}

export interface MatchHistoryItem {
  profileId: string;
  sentAt: string;
  status: 'Sent' | 'Accepted' | 'Declined' | 'Feedback Received';
  feedback?: string;
  emailDraft?: string;
}

export interface Matchmaker {
  username: string;
  name: string;
  role: string;
}

export interface MatchScoreResult {
  score: number;
  breakdown: {
    ageCompatibility: number;
    incomeCompatibility: number;
    heightCompatibility: number;
    locationCompatibility: number;
    culturalCompatibility: number;
    lifestyleCompatibility: number;
    educationCompatibility: number;
    astrologyCompatibility: number;
  };
  reasons: string[];
  redFlags: string[];
}
