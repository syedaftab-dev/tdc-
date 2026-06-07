import { Profile, Client, Gender, FamilyValues, FamilyType, FamilyStatus, ManglikStatus, HoroscopeImportance, KidsPreference, RelocationPreference, PetsPreference, DietPreference, Habits } from '../types/index.js';

// Deterministic seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Returns a value between 0 and 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Returns an integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Selects a random element from an array
  pick<T>(arr: T[] | readonly T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }

  // Selects multiple random elements from an array
  pickMultiple<T>(arr: T[] | readonly T[], count: number): T[] {
    const shuffled = [...arr].sort(() => this.next() - 0.5);
    return shuffled.slice(0, count);
  }
}

const FIRST_NAMES_MALE = [
  'Aarav', 'Rahul', 'Vikram', 'Rohan', 'Amit', 'Siddharth', 'Kabir', 'Vivek', 'Arjun', 'Karan',
  'Aditya', 'Yash', 'Neil', 'Kunal', 'Dev', 'Ishaan', 'Ansh', 'Sameer', 'Ritesh', 'Pranav',
  'Abhishek', 'Mayank', 'Gaurav', 'Varun', 'Rithvik', 'Manish', 'Tushar', 'Akash', 'Shreyas', 'Dhruv'
];

const FIRST_NAMES_FEMALE = [
  'Ananya', 'Priya', 'Riya', 'Neha', 'Aisha', 'Sneha', 'Tanvi', 'Kavya', 'Pooja', 'Meera',
  'Shreya', 'Aditi', 'Divya', 'Shruti', 'Pallavi', 'Ritu', 'Payal', 'Kiara', 'Natasha', 'Ishita',
  'Kriti', 'Meghna', 'Nisha', 'Ridhi', 'Sanjana', 'Taruni', 'Vaidehi', 'Zara', 'Diya', 'Niharika'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Iyer', 'Patel', 'Nair', 'Joshi', 'Reddy', 'Mehta', 'Chatterjee',
  'Kapoor', 'Rao', 'Malhotra', 'Singh', 'Sen', 'Deshmukh', 'Bhat', 'Choudhury', 'Singhal', 'Bansal',
  'Trivedi', 'Menon', 'Pillai', 'Mukherjee', 'Goel', 'Dubey', 'Chawla', 'Sethi', 'Saxena', 'Prasad'
];

const CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { city: 'Delhi', state: 'Delhi NCR', country: 'India' },
  { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  { city: 'Pune', state: 'Maharashtra', country: 'India' },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  { city: 'Gurgaon', state: 'Delhi NCR', country: 'India' },
  { city: 'Noida', state: 'Delhi NCR', country: 'India' },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India' }
];

const COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Kharagpur', 'BITS Pilani', 'SRCC, Delhi', 'St. Stephen\'s College',
  'Delhi Technological University', 'RV College of Engineering', 'Anna University', 'Mumbai University',
  'Symbiosis Institute', 'NIFT Delhi', 'Manipal Academy of Higher Education', 'IIM Ahmedabad', 'ISB Hyderabad'
];

const DEGREES = [
  'B.Tech in Computer Science', 'B.Tech in Electrical Engineering', 'B.Tech in Mechanical Engineering',
  'M.Tech in Data Science', 'B.Com (Hons)', 'MBA in Finance', 'MBA in Marketing', 'MBBS', 'MD',
  'B.A. in Economics (Hons)', 'Bachelor of Design (B.Des)', 'BCA', 'MCA', 'B.Arch', 'Chartered Accountant (CA)'
];

const COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'McKinsey & Company', 'Boston Consulting Group (BCG)',
  'Tata Consultancy Services (TCS)', 'Infosys', 'Apollo Hospitals', 'Adobe', 'CRED',
  'Zomato', 'Flipkart', 'Goldman Sachs', 'JP Morgan Chase', 'HDFC Bank', 'Reliance Industries'
];

const DESIGNATIONS = [
  'Software Engineer II', 'Senior Product Manager', 'Management Consultant', 'Senior Analyst',
  'Pediatrician', 'Marketing Director', 'Lead UX Designer', 'Investment Banker', 'Data Scientist',
  'HR Business Partner', 'Operations Manager', 'Solution Architect', 'Chief of Staff', 'Founder'
];

const RELIGIONS = ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain'] as const;

const CASTES_BY_RELIGION = {
  Hindu: ['Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Khatri', 'Maratha', 'Nair', 'Lingayat', 'Patel', 'Aggarwal'],
  Muslim: ['Sunni', 'Shia', 'Pathan', 'Syed', 'Sheikh'],
  Sikh: ['Jat Sikh', 'Khatri Sikh', 'Ramgarhia Sikh', 'Arora Sikh'],
  Christian: ['Roman Catholic', 'Protestant', 'Syrian Christian', 'Pentecostal'],
  Jain: ['Oswal', 'Agarwal Jain', 'Khandelwal', 'Digambar', 'Shvetambar']
};

const GOTHRAS = ['Kashyap', 'Vashisht', 'Bharadwaj', 'Sandilya', 'Atri', 'Garg', 'Gautama', 'Vishwamitra', 'Haritasya', 'Jamadagni', 'N/A'];
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const RASHIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

const HOBBIES = [
  'Hiking', 'Reading Books', 'Playing Guitar', 'Cooking', 'Traveling', 'Photography', 'Painting', 
  'Yoga', 'Cycling', 'Running', 'Gardening', 'Watching Anime', 'Playing Tennis', 'Baking', 'Coffee Brewing'
];

const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Punjabi', 'Malayalam', 'Kannada'];

const SIBLINGS_OPTIONS = [
  'None', '1 brother', '1 sister', '1 brother, 1 sister', '2 brothers', '2 sisters', '1 elder brother', '1 younger sister'
];

const FATHER_OCCUPATIONS = ['Retired Govt Officer', 'Businessman', 'Doctor', 'Engineer', 'Bank Manager', 'Professor', 'Architect', 'Defense Services'];
const MOTHER_OCCUPATIONS = ['Homemaker', 'Teacher', 'Doctor', 'Bank Employee', 'Professor', 'Artist', 'Government Service', 'Business Owner'];

const ABOUT_TEMPLATES_MALE = [
  "I'm a goal-oriented and warm person who believes in balancing career ambitions with family life. I enjoy weekend treks, listening to music, and exploring new cafes.",
  "Simple, down-to-earth, and family-oriented. Working in tech but also love photography and storytelling. Looking for a partner who is a friend first.",
  "Independent and passionate about what I do. I love staying active, cooking Indian food, and deep conversations over coffee. Seeking an emotionally mature partner.",
  "An optimistic individual with a modern outlook, yet deeply rooted in cultural values. I enjoy running, reading non-fiction, and spending quality time with family."
];

const ABOUT_TEMPLATES_FEMALE = [
  "A bubbly, empathetic, and independent woman. I love my career but equally value family warmth. Passionate about art, traveling, and good books.",
  "I would describe myself as a blend of traditional values and modern thinking. I enjoy classical dance, baking, and playing board games with friends.",
  "Ambitious, creative, and passionate about life. I love exploring new cities, learning different languages, and practicing yoga. Looking for a supportive partner.",
  "An easygoing person who appreciates the simple things in life. I love cooking, playing acoustic guitar, and spending time outdoors. Seeking compatibility, respect, and love."
];

// Seeded generator to build exactly 120 matching profiles
export function generatePoolProfiles(count = 120): Profile[] {
  const rng = new SeededRandom(42); // Seed 42 for pool
  const profiles: Profile[] = [];

  for (let i = 1; i <= count; i++) {
    const gender: Gender = rng.next() > 0.5 ? 'Male' : 'Female';
    const firstName = gender === 'Male' ? rng.pick(FIRST_NAMES_MALE) : rng.pick(FIRST_NAMES_FEMALE);
    const lastName = rng.pick(LAST_NAMES);
    
    // Age and DOB
    const age = rng.nextInt(23, 35);
    const birthYear = 2026 - age; // Current time is 2026
    const birthMonth = rng.nextInt(1, 12);
    const birthDay = rng.nextInt(1, 28);
    const dob = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
    
    // Location
    const loc = rng.pick(CITIES);
    
    // Height (e.g. 5'0" to 6'4")
    const heightFt = gender === 'Male' ? rng.nextInt(5, 6) : rng.nextInt(5, 5);
    const heightIn = gender === 'Male' 
      ? (heightFt === 6 ? rng.nextInt(0, 4) : rng.nextInt(4, 11))
      : (heightFt === 5 ? rng.nextInt(0, 9) : rng.nextInt(0, 3));
    
    const height = `${heightFt}'${heightIn}"`;
    const heightCm = Math.round((heightFt * 12 + heightIn) * 2.54);
    
    // Education & Career
    const undergradCollege = rng.pick(COLLEGES);
    const degree = rng.pick(DEGREES);
    
    // Income in LPA
    // Higher average for males/females depending on random skew, typically between 8 and 75 LPA
    const baseIncome = rng.nextInt(8, 45);
    const premiumIncome = rng.next() > 0.85 ? rng.nextInt(46, 85) : 0;
    const income = baseIncome + premiumIncome;
    
    const currentCompany = rng.pick(COMPANIES);
    const designation = rng.pick(DESIGNATIONS);
    
    // Family
    const maritalStatus = rng.next() > 0.92 ? rng.pick(['Divorced', 'Widowed'] as const) : 'Never Married';
    const langCount = rng.nextInt(2, 4);
    const languagesKnown = rng.pickMultiple(LANGUAGES, langCount);
    if (!languagesKnown.includes('English')) languagesKnown.push('English');
    if (!languagesKnown.includes('Hindi') && rng.next() > 0.3) languagesKnown.push('Hindi');
    
    const siblings = rng.pick(SIBLINGS_OPTIONS);
    const familyValues: FamilyValues = rng.pick(['Traditional', 'Moderate', 'Liberal'] as const);
    const familyType: FamilyType = rng.pick(['Nuclear', 'Joint'] as const);
    const familyStatus: FamilyStatus = rng.pick(['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent'] as const);
    const fatherOccupation = rng.pick(FATHER_OCCUPATIONS);
    const motherOccupation = rng.pick(MOTHER_OCCUPATIONS);
    
    // Religion & Caste
    const religion = rng.pick(RELIGIONS);
    const casteList = CASTES_BY_RELIGION[religion];
    const caste = rng.pick(casteList);
    const gothra = religion === 'Hindu' ? rng.pick(GOTHRAS) : 'N/A';
    const nakshatra = religion === 'Hindu' ? rng.pick(NAKSHATRAS) : 'N/A';
    const rashi = religion === 'Hindu' ? rng.pick(RASHIS) : 'N/A';
    const manglikStatus: ManglikStatus = religion === 'Hindu' ? rng.pick(['Yes', 'No', 'Partial', 'Dont Know'] as const) : 'No';
    const horoscopeImportance: HoroscopeImportance = rng.pick(['High', 'Medium', 'Low'] as const);
    
    // Lifestyle Preferences
    const wantKids: KidsPreference = rng.pick(['Yes', 'No', 'Maybe'] as const);
    const openToRelocate: RelocationPreference = rng.pick(['Yes', 'No', 'Maybe'] as const);
    const openToPets: PetsPreference = rng.pick(['Yes', 'No', 'Maybe'] as const);
    const diet: DietPreference = rng.pick(['Veg', 'Non-Veg', 'Eggetarian', 'Jain', 'Vegan'] as const);
    const smoke: Habits = rng.pick(['Yes', 'No', 'Occasionally'] as const);
    const drink: Habits = rng.pick(['Yes', 'No', 'Occasionally'] as const);
    
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${rng.nextInt(10, 99)}@gmail.com`;
    const phone = `+91 ${rng.nextInt(70000, 99999)} ${rng.nextInt(10000, 99999)}`;
    const aboutMe = gender === 'Male' ? rng.pick(ABOUT_TEMPLATES_MALE) : rng.pick(ABOUT_TEMPLATES_FEMALE);
    const hobbies = rng.pickMultiple(HOBBIES, rng.nextInt(2, 4));

    profiles.push({
      id: `p_${i}`,
      firstName,
      lastName,
      gender,
      dob,
      age,
      country: loc.country,
      city: loc.city,
      height,
      heightCm,
      email,
      phone,
      undergradCollege,
      degree,
      income,
      currentCompany,
      designation,
      maritalStatus,
      languagesKnown,
      siblings,
      familyValues,
      familyType,
      familyStatus,
      fatherOccupation,
      motherOccupation,
      religion,
      caste,
      gothra,
      nakshatra,
      rashi,
      manglikStatus,
      horoscopeImportance,
      wantKids,
      openToRelocate,
      openToPets,
      diet,
      smoke,
      drink,
      aboutMe,
      hobbies
    });
  }

  return profiles;
}

export function generateStaticClients(): Client[] {
  return [
    {
      id: 'c_1',
      firstName: 'Rohan',
      lastName: 'Mehta',
      gender: 'Male',
      dob: '1996-04-12',
      age: 30,
      country: 'India',
      city: 'Mumbai',
      height: `5'11"`,
      heightCm: 180,
      email: 'rohan.mehta@gmail.com',
      phone: '+91 98201 12345',
      undergradCollege: 'IIT Bombay',
      degree: 'B.Tech in Computer Science',
      income: 45,
      currentCompany: 'Google',
      designation: 'Senior Software Engineer',
      maritalStatus: 'Never Married',
      languagesKnown: ['English', 'Hindi', 'Gujarati'],
      siblings: '1 younger sister',
      familyValues: 'Moderate',
      familyType: 'Nuclear',
      familyStatus: 'Upper Middle Class',
      fatherOccupation: 'Retired Banker',
      motherOccupation: 'Homemaker',
      religion: 'Hindu',
      caste: 'Brahmin',
      gothra: 'Kashyap',
      nakshatra: 'Rohini',
      rashi: 'Vrishabha',
      manglikStatus: 'No',
      horoscopeImportance: 'Medium',
      wantKids: 'Yes',
      openToRelocate: 'Maybe',
      openToPets: 'Yes',
      diet: 'Veg',
      smoke: 'No',
      drink: 'Occasionally',
      aboutMe: 'I am a software engineer in Google Mumbai. I love hiking, playing board games, and spending time with family. Looking for an independent, caring partner with shared values.',
      hobbies: ['Hiking', 'Board Games', 'Coffee Brewing'],
      assignedMatchmaker: 'Karan Johar',
      status: 'Active Search',
      notes: [
        {
          id: 'n_1',
          timestamp: '2026-06-01T10:00:00Z',
          author: 'Karan Johar',
          text: 'Rohan is very clear about wanting a vegetarian partner. Prefers someone in Mumbai or open to relocating. Career-oriented but values family highly.'
        }
      ],
      matchHistory: []
    },
    {
      id: 'c_2',
      firstName: 'Ananya',
      lastName: 'Sharma',
      gender: 'Female',
      dob: '1998-08-22',
      age: 28,
      country: 'India',
      city: 'Delhi',
      height: `5'4"`,
      heightCm: 162,
      email: 'ananya.sharma@yahoo.com',
      phone: '+91 99100 98765',
      undergradCollege: 'SRCC, Delhi',
      degree: 'B.Com (Hons)',
      income: 30,
      currentCompany: 'McKinsey & Company',
      designation: 'Management Consultant',
      maritalStatus: 'Never Married',
      languagesKnown: ['English', 'Hindi', 'Punjabi'],
      siblings: '1 elder brother',
      familyValues: 'Liberal',
      familyType: 'Nuclear',
      familyStatus: 'Rich',
      fatherOccupation: 'Senior Advocate, High Court',
      motherOccupation: 'Doctor',
      religion: 'Hindu',
      caste: 'Khatri',
      gothra: 'Vashisht',
      nakshatra: 'Chitra',
      rashi: 'Kanya',
      manglikStatus: 'No',
      horoscopeImportance: 'Low',
      wantKids: 'Maybe',
      openToRelocate: 'Yes',
      openToPets: 'Yes',
      diet: 'Non-Veg',
      smoke: 'No',
      drink: 'Occasionally',
      aboutMe: 'Work in consulting, which keeps me busy but I make sure to travel and paint on weekends. Looking for an ambitious, broad-minded partner who respects career goals and loves to travel.',
      hobbies: ['Painting', 'Traveling', 'Yoga'],
      assignedMatchmaker: 'Karan Johar',
      status: 'New',
      notes: [
        {
          id: 'n_2',
          timestamp: '2026-06-03T14:30:00Z',
          author: 'Karan Johar',
          text: 'Ananya is open to relocating anywhere in India or abroad for the right partner. High focus on educational background (prefers IIT/IIM/Ivy League graduates).'
        }
      ],
      matchHistory: []
    },
    {
      id: 'c_3',
      firstName: 'Vikram',
      lastName: 'Reddy',
      gender: 'Male',
      dob: '1993-11-05',
      age: 32,
      country: 'India',
      city: 'Hyderabad',
      height: `6'0"`,
      heightCm: 183,
      email: 'vikram.reddy@gmail.com',
      phone: '+91 98480 23456',
      undergradCollege: 'BITS Pilani',
      degree: 'B.Tech + MBA (ISB)',
      income: 65,
      currentCompany: 'CRED',
      designation: 'Director of Product',
      maritalStatus: 'Never Married',
      languagesKnown: ['English', 'Telugu', 'Hindi'],
      siblings: 'None',
      familyValues: 'Moderate',
      familyType: 'Joint',
      familyStatus: 'Affluent',
      fatherOccupation: 'Real Estate Developer',
      motherOccupation: 'Business Owner',
      religion: 'Hindu',
      caste: 'Reddy',
      gothra: 'Bharadwaj',
      nakshatra: 'Hasta',
      rashi: 'Kanya',
      manglikStatus: 'Yes',
      horoscopeImportance: 'High',
      wantKids: 'Yes',
      openToRelocate: 'No',
      openToPets: 'No',
      diet: 'Non-Veg',
      smoke: 'No',
      drink: 'Yes',
      aboutMe: 'Director of Product at a fintech in Bangalore/Hyd. Family oriented, loves playing tennis and investing. Looking for a partner who is warm, values-oriented, and ready to settle down in Hyderabad.',
      hobbies: ['Playing Tennis', 'Investing', 'Reading Books'],
      assignedMatchmaker: 'Karan Johar',
      status: 'Active Search',
      notes: [
        {
          id: 'n_3',
          timestamp: '2026-06-02T11:00:00Z',
          author: 'Karan Johar',
          text: 'Vikram is Manglik and his family takes Kundali matching very seriously (High importance). Must check Manglik alignment or score compatibility.'
        }
      ],
      matchHistory: []
    },
    {
      id: 'c_4',
      firstName: 'Priya',
      lastName: 'Nair',
      gender: 'Female',
      dob: '1995-03-18',
      age: 31,
      country: 'India',
      city: 'Bangalore',
      height: `5'3"`,
      heightCm: 160,
      email: 'priya.nair@outlook.com',
      phone: '+91 94470 54321',
      undergradCollege: 'Manipal Academy',
      degree: 'MBBS + MD (Pediatrics)',
      income: 25,
      currentCompany: 'Apollo Hospitals',
      designation: 'Pediatrician',
      maritalStatus: 'Never Married',
      languagesKnown: ['English', 'Malayalam', 'Hindi', 'Tamil'],
      siblings: '1 elder sister',
      familyValues: 'Liberal',
      familyType: 'Nuclear',
      familyStatus: 'Upper Middle Class',
      fatherOccupation: 'Retired Surgeon',
      motherOccupation: 'Professor of English',
      religion: 'Christian',
      caste: 'Syrian Christian',
      gothra: 'N/A',
      nakshatra: 'N/A',
      rashi: 'N/A',
      manglikStatus: 'No',
      horoscopeImportance: 'Low',
      wantKids: 'Yes',
      openToRelocate: 'Maybe',
      openToPets: 'Yes',
      diet: 'Non-Veg',
      smoke: 'No',
      drink: 'Occasionally',
      aboutMe: 'Pediatrician at Apollo. Passionate about child health, classical music, and traveling. Looking for a compassionate partner, preferably a doctor or corporate professional, who shares similar values.',
      hobbies: ['Singing', 'Traveling', 'Baking'],
      assignedMatchmaker: 'Karan Johar',
      status: 'Meeting Stage',
      notes: [
        {
          id: 'n_4',
          timestamp: '2026-05-28T16:00:00Z',
          author: 'Karan Johar',
          text: 'Priya is a doctor and would highly prefer a fellow doctor or a highly qualified professional. Christian profiles are preferred but she is open.'
        }
      ],
      matchHistory: []
    },
    {
      id: 'c_5',
      firstName: 'Jaspreet',
      lastName: 'Singh',
      gender: 'Male',
      dob: '1994-07-30',
      age: 31,
      country: 'India',
      city: 'Pune',
      height: `6'1"`,
      heightCm: 185,
      email: 'jaspreet.singh@gmail.com',
      phone: '+91 98123 45678',
      undergradCollege: 'Symbiosis Pune',
      degree: 'BBA + MBA',
      income: 28,
      currentCompany: 'Tata Motors',
      designation: 'Senior Marketing Manager',
      maritalStatus: 'Never Married',
      languagesKnown: ['English', 'Punjabi', 'Hindi'],
      siblings: '2 brothers',
      familyValues: 'Traditional',
      familyType: 'Joint',
      familyStatus: 'Middle Class',
      fatherOccupation: 'Businessman (Auto parts)',
      motherOccupation: 'Homemaker',
      religion: 'Sikh',
      caste: 'Jat Sikh',
      gothra: 'N/A',
      nakshatra: 'N/A',
      rashi: 'N/A',
      manglikStatus: 'No',
      horoscopeImportance: 'Medium',
      wantKids: 'Yes',
      openToRelocate: 'No',
      openToPets: 'Yes',
      diet: 'Non-Veg',
      smoke: 'No',
      drink: 'Occasionally',
      aboutMe: 'Marketing Manager in Pune. Fun loving, fond of road trips, Punjabi music, and home-cooked food. Looking for a simple, family-oriented girl, preferably Sikh, to join our joint family.',
      hobbies: ['Road Trips', 'Cooking', 'Running'],
      assignedMatchmaker: 'Karan Johar',
      status: 'Sent Matches',
      notes: [
        {
          id: 'n_5',
          timestamp: '2026-05-30T09:00:00Z',
          author: 'Karan Johar',
          text: 'Prefers a Sikh girl who is family-oriented and comfortable living in a joint family system. Diet preferences are flexible.'
        }
      ],
      matchHistory: []
    },
    {
      id: 'c_6',
      firstName: 'Sneha',
      lastName: 'Patel',
      gender: 'Female',
      dob: '1997-02-14',
      age: 29,
      country: 'India',
      city: 'Ahmedabad',
      height: `5'5"`,
      heightCm: 165,
      email: 'sneha.patel@gmail.com',
      phone: '+91 97243 12345',
      undergradCollege: 'NIFT Delhi',
      degree: 'Bachelor of Design',
      income: 18,
      currentCompany: 'Self-Employed',
      designation: 'Fashion Designer & Boutique Owner',
      maritalStatus: 'Never Married',
      languagesKnown: ['English', 'Gujarati', 'Hindi'],
      siblings: '1 brother',
      familyValues: 'Traditional',
      familyType: 'Nuclear',
      familyStatus: 'Upper Middle Class',
      fatherOccupation: 'Textile Manufacturer',
      motherOccupation: 'Boutique partner',
      religion: 'Hindu',
      caste: 'Patel',
      gothra: 'Sandilya',
      nakshatra: 'Uttara Phalguni',
      rashi: 'Kanya',
      manglikStatus: 'No',
      horoscopeImportance: 'High',
      wantKids: 'Yes',
      openToRelocate: 'Maybe',
      openToPets: 'No',
      diet: 'Veg',
      smoke: 'No',
      drink: 'No',
      aboutMe: 'Running my own design studio in Ahmedabad. Creative, love listening to instrumental music, and visiting heritage sites. Looking for a Gujarati partner, well settled, with a respectful and supportive mindset.',
      hobbies: ['Sewing', 'Traveling', 'Photography'],
      assignedMatchmaker: 'Karan Johar',
      status: 'Active Search',
      notes: [
        {
          id: 'n_6',
          timestamp: '2026-06-04T12:00:00Z',
          author: 'Karan Johar',
          text: 'Family is strictly vegetarian (and no smoking/drinking). Horoscope matching is crucial. Patel matching is highly preferred.'
        }
      ],
      matchHistory: []
    }
  ];
}
