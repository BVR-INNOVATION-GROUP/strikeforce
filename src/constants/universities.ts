/**
 * University data constants
 */
export interface DepartmentI {
  id: string | number;
  name: string;
  courses: CourseI[];
}

export interface CourseI {
  id: string | number;
  name: string;
  year?: number; // Optional for backward compatibility with project forms
}

export interface University {
  id: string | number;
  name: string;
  departments: DepartmentI[];
}

export const topUgandanUniversities: University[] = [
  {
    id: 1,
    name: "Makerere University",
    departments: [
      {
        id: 1,
        name: "Computer Science",
        courses: [
          { id: 1, name: "Introduction to Programming", year: 1 },
          { id: 2, name: "Data Structures", year: 2 },
          { id: 3, name: "Software Engineering", year: 3 },
          { id: 4, name: "Final Year Project", year: 4 },
        ],
      },
      {
        id: 2,
        name: "Engineering",
        courses: [
          { id: 5, name: "Engineering Fundamentals", year: 1 },
          { id: 6, name: "Mechanical Design", year: 3 },
          { id: 7, name: "Capstone Project", year: 4 },
        ],
      },
      { id: 3, name: "Medicine", courses: [] },
      { id: 4, name: "Business Administration", courses: [] },
    ],
  },
  {
    id: 2,
    name: "Kyambogo University",
    departments: [
      { id: 1, name: "Engineering", courses: [] },
      { id: 2, name: "Education", courses: [] },
      { id: 3, name: "Management Science", courses: [] },
    ],
  },
  {
    id: 3,
    name: "Uganda Christian University",
    departments: [
      { id: 1, name: "Law", courses: [] },
      { id: 2, name: "Business", courses: [] },
      { id: 3, name: "Social Sciences", courses: [] },
    ],
  },
  {
    id: 4,
    name: "Mbarara University of Science and Technology",
    departments: [
      { id: 1, name: "Medicine", courses: [] },
      { id: 2, name: "Computer Science", courses: [] },
      { id: 3, name: "Engineering", courses: [] },
    ],
  },
  { id: 5, name: "Kampala International University", departments: [] },
  { id: 6, name: "Gulu University", departments: [] },
  { id: 7, name: "Ndejje University", departments: [] },
  { id: 8, name: "Uganda Martyrs University", departments: [] },
  { id: 9, name: "Nkumba University", departments: [] },
  { id: 10, name: "Busitema University", departments: [] },
  { id: 11, name: "Islamic University in Uganda", departments: [] },
  { id: 12, name: "Bishop Stuart University", departments: [] },
  { id: 13, name: "Kabale University", departments: [] },
  {
    id: 14,
    name: "Uganda Technology and Management University",
    departments: [],
  },
];

/**
 * Comprehensive skills list covering all academic and professional disciplines
 * Organized by category for better discoverability
 */
export const allSkills = [
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "C", "Go", "Rust", "Swift", "Kotlin", 
  "PHP", "Ruby", "Perl", "R", "MATLAB", "Scala", "Haskell", "Erlang", "Elixir", "Dart", "Lua",
  
  // Web Development
  "HTML", "CSS", "SASS/SCSS", "Tailwind CSS", "Bootstrap", "React", "Vue.js", "Angular", "Next.js", 
  "Nuxt.js", "Svelte", "Webpack", "Vite", "Node.js", "Express.js", "Django", "Flask", "FastAPI",
  "Laravel", "Spring Boot", "ASP.NET", "REST API", "GraphQL", "WebSocket", "Serverless",
  
  // Mobile Development
  "React Native", "Flutter", "Ionic", "Xamarin", "Native iOS", "Native Android",
  
  // Databases
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase", "Supabase", "SQLite", "Oracle", 
  "SQL Server", "Cassandra", "Elasticsearch", "DynamoDB", "Neo4j",
  
  // Cloud & DevOps
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", 
  "CI/CD", "GitLab CI", "GitHub Actions", "Linux", "Bash Scripting", "Nginx", "Apache",
  
  // Data Science & Analytics
  "Data Analysis", "Data Visualization", "Machine Learning", "Deep Learning", "TensorFlow", 
  "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Jupyter", "Tableau", "Power BI", 
  "Statistical Analysis", "Business Intelligence", "ETL", "Data Mining",
  
  // Design & Creative
  "UI/UX Design", "Graphic Design", "Web Design", "Figma", "Adobe XD", "Sketch", "Photoshop", 
  "Illustrator", "InDesign", "After Effects", "Premiere Pro", "Framer", "Prototyping",
  "User Research", "Wireframing", "Branding", "Typography", "Color Theory",
  
  // Business & Management
  "Project Management", "Agile", "Scrum", "Kanban", "Lean", "Business Analysis", 
  "Strategic Planning", "Financial Analysis", "Market Research", "Business Development",
  "Operations Management", "Supply Chain Management", "Quality Assurance", "Risk Management",
  "Change Management", "Stakeholder Management",
  
  // Marketing & Communications
  "Digital Marketing", "SEO", "SEM", "Social Media Marketing", "Content Marketing", 
  "Email Marketing", "PPC Advertising", "Google Analytics", "Marketing Strategy",
  "Brand Management", "Public Relations", "Copywriting", "Content Writing", "Technical Writing",
  "Copy Editing", "Journalism", "Video Production", "Photography",
  
  // Finance & Accounting
  "Financial Accounting", "Management Accounting", "Financial Analysis", "Investment Analysis",
  "Risk Assessment", "Tax Planning", "Auditing", "Bookkeeping", "QuickBooks", "SAP", "Excel",
  "Financial Modeling", "Budgeting", "Forecasting", "Corporate Finance", "Portfolio Management",
  "Financial Planning", "Wealth Management", "Insurance", "Banking", "Credit Analysis",
  
  // Engineering
  "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Chemical Engineering",
  "Aerospace Engineering", "Biomedical Engineering", "Environmental Engineering", "CAD", "AutoCAD",
  "SolidWorks", "MATLAB", "Simulink", "ANSYS", "Finite Element Analysis", "Product Design",
  "Structural Engineering", "Geotechnical Engineering", "Transportation Engineering", "Water Resources",
  "Materials Engineering", "Industrial Engineering", "Systems Engineering", "Robotics",
  
  // Construction & Architecture
  "Construction Management", "Project Planning", "Building Design", "Architectural Design",
  "Construction Safety", "Quantity Surveying", "Site Management", "Building Information Modeling (BIM)",
  "Construction Estimation", "Contract Management", "Building Codes", "Sustainable Construction",
  "Urban Planning", "Landscape Architecture", "Interior Design", "Structural Design",
  
  // Science & Research
  "Research Methodology", "Laboratory Skills", "Data Collection", "Statistical Analysis",
  "Scientific Writing", "Literature Review", "Experimental Design", "Biotechnology",
  "Chemistry", "Physics", "Biology", "Environmental Science", "Geology", "Astronomy",
  "Meteorology", "Oceanography", "Ecology", "Genetics", "Microbiology", "Neuroscience",
  
  // Healthcare & Medicine
  "Clinical Research", "Medical Writing", "Healthcare Administration", "Patient Care",
  "Medical Records", "Health Informatics", "Public Health", "Epidemiology", "Nursing",
  "Pharmacy", "Physical Therapy", "Occupational Therapy", "Medical Imaging", "Laboratory Medicine",
  "Health Education", "Health Policy", "Mental Health", "Nutrition", "Dentistry", "Veterinary Medicine",
  
  // Law & Legal
  "Legal Research", "Contract Drafting", "Legal Writing", "Compliance", "Intellectual Property",
  "Corporate Law", "Criminal Law", "Family Law", "International Law", "Constitutional Law",
  "Employment Law", "Tax Law", "Immigration Law", "Real Estate Law", "Litigation",
  
  // Arts & Humanities
  "Fine Arts", "Painting", "Sculpture", "Drawing", "Printmaking", "Art History", "Art Criticism",
  "Creative Writing", "Poetry", "Fiction Writing", "Screenwriting", "Playwriting",
  "Music Composition", "Music Performance", "Music Theory", "Music Production", "Sound Design",
  "Theater", "Acting", "Directing", "Stage Design", "Dance", "Choreography",
  "Film Production", "Cinematography", "Video Editing", "Animation", "Storyboarding",
  
  // History & Social Sciences
  "Historical Research", "Historiography", "Archaeology", "Anthropology", "Sociology",
  "Political Science", "International Relations", "Economics", "Behavioral Economics",
  "Psychology", "Social Psychology", "Cognitive Psychology", "Developmental Psychology",
  "Cultural Studies", "Gender Studies", "Ethnic Studies", "Philosophy", "Ethics",
  
  // Education & Training
  "Curriculum Development", "Instructional Design", "E-Learning", "Training Delivery",
  "Educational Technology", "Assessment Design", "Pedagogy", "Educational Psychology",
  "Classroom Management", "Special Education", "Adult Education", "Early Childhood Education",
  
  // Languages
  "English", "French", "Spanish", "German", "Chinese", "Japanese", "Arabic", "Swahili",
  "Portuguese", "Italian", "Russian", "Hindi", "Korean", "Turkish", "Dutch", "Greek",
  "Translation", "Interpretation", "Linguistics", "Language Teaching",
  
  // Agriculture & Environmental
  "Agricultural Science", "Agronomy", "Horticulture", "Animal Science", "Soil Science",
  "Agricultural Economics", "Sustainable Agriculture", "Food Science", "Food Safety",
  "Environmental Management", "Climate Change", "Renewable Energy", "Waste Management",
  "Conservation", "Wildlife Management", "Forestry", "Fisheries",
  
  // Hospitality & Tourism
  "Hotel Management", "Restaurant Management", "Event Planning", "Tourism Management",
  "Culinary Arts", "Food & Beverage", "Customer Service", "Hospitality Operations",
  
  // Media & Communications
  "Broadcasting", "Journalism", "News Writing", "Investigative Reporting", "Podcasting",
  "Radio Production", "Television Production", "Media Relations", "Crisis Communication",
  
  // Soft Skills
  "Communication", "Leadership", "Teamwork", "Problem Solving", "Critical Thinking",
  "Time Management", "Organization", "Adaptability", "Creativity", "Negotiation",
  "Conflict Resolution", "Presentation Skills", "Public Speaking", "Emotional Intelligence",
  "Active Listening", "Empathy", "Decision Making", "Strategic Thinking",
  
  // Other Technical
  "Git", "Version Control", "Code Review", "Testing", "Unit Testing", "Integration Testing",
  "Test Automation", "Performance Testing", "Security", "Cybersecurity", "Network Security",
  "Blockchain", "Smart Contracts", "Cryptocurrency", "IoT", "Embedded Systems",
  "Game Development", "Unity", "Unreal Engine", "3D Modeling", "Blender",
];

/**
 * Legacy export for backward compatibility
 * @deprecated Use allSkills instead
 */
export const commonSkills = allSkills;





