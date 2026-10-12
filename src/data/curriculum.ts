import { SemesterCurriculum, GradingScaleTier, CourseInfo, LabAssessmentItem } from '../types';

export const GRADING_SCALE: GradingScaleTier[] = [
  { minScore: 80, maxScore: 100, letterGrade: 'A+', gradePoint: 4.00, rangeLabel: '80% or above' },
  { minScore: 75, maxScore: 79.99, letterGrade: 'A', gradePoint: 3.75, rangeLabel: '75% to less than 80%' },
  { minScore: 70, maxScore: 74.99, letterGrade: 'A-', gradePoint: 3.50, rangeLabel: '70% to less than 75%' },
  { minScore: 65, maxScore: 69.99, letterGrade: 'B+', gradePoint: 3.25, rangeLabel: '65% to less than 70%' },
  { minScore: 60, maxScore: 64.99, letterGrade: 'B', gradePoint: 3.00, rangeLabel: '60% to less than 65%' },
  { minScore: 55, maxScore: 59.99, letterGrade: 'B-', gradePoint: 2.75, rangeLabel: '55% to less than 60%' },
  { minScore: 50, maxScore: 54.99, letterGrade: 'C+', gradePoint: 2.50, rangeLabel: '50% to less than 55%' },
  { minScore: 45, maxScore: 49.99, letterGrade: 'C', gradePoint: 2.25, rangeLabel: '45% to less than 50%' },
  { minScore: 40, maxScore: 44.99, letterGrade: 'D', gradePoint: 2.00, rangeLabel: '40% to less than 45%' },
  { minScore: 0, maxScore: 39.99, letterGrade: 'F', gradePoint: 0.00, rangeLabel: 'Less than 40%' },
];

export const ALL_SEMESTERS_CURRICULUM: SemesterCurriculum[] = [
  {
    key: 'y1s1',
    name: 'Year 1, Semester 1',
    shortLabel: '1.1',
    year: 1,
    semester: 1,
    totalCredits: 20.25,
    theoryHours: 15,
    labHours: 10.5,
    courses: [
      {
        code: 'HUM1107',
        credits: 3.0,
        title: 'Critical Thinking and Communication',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Language, Speaking and Writing. Introduction to communication, Language and grammar skills, Speaking skills, Writing skills.',
        books: ['Maniruzzaman Dr. M., Advanced Reading and Writing Skills', 'Pyle A.M., Cliffs TOEFL', 'O’Connor J.D., Better English Pronunciation']
      },
      {
        code: 'HUM1108',
        credits: 1.5,
        title: 'English Language Sessional',
        hours: '0-3',
        prerequisite: 'Nil',
        isSessional: true,
        syllabus: 'Building vocabulary, Building sentences, Grammar, Pronunciation drills, Phonetics, Vowels, Diphthongs, Consonants, Conversational skills, Thesis writing.',
        books: ['Better English Pronunciation, Cambridge University Press']
      },
      {
        code: 'MATH1115',
        credits: 3.0,
        title: 'Mathematics-I (Differential Calculus & Co-ordinate Geometry)',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Limit, Continuity, Differentiability, Taylor’s theorem, Partial Differentiation, Tangent & Normal, Maxima & Minima. 2D/3D Geometry: Transformation of Coordinates, Pair of Straight lines, System of circles, Planes.',
        books: ['Howard A., Calculus', 'Mohammad, Bhattacharjee, Latif, Differential Calculus', 'Rahman, Bhattacharjee, Co-ordinate Geometry']
      },
      {
        code: 'PHY1115',
        credits: 3.0,
        title: 'Physics',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Electromagnetism (Lorentz force, Ampere’s law, Faraday’s Law, Biot-Savart law). States of Matter, Waves and Oscillations, Physical Optics (Interference, Diffraction, Polarization).',
        books: ['Resnick R., Halliday D., Physics: Part II', 'Subrahmanyam N., Brijlal, Optics & Wave and Oscillation', 'Tewary K.K., Electricity and Magnetism']
      },
      {
        code: 'PHY1116',
        credits: 0.75,
        title: 'Physics Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Laboratory experiments based on PHY1115 optics, mechanics and electricity.',
      },
      {
        code: 'CHEM1115',
        credits: 3.0,
        title: 'Chemistry',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Atomic structure, Chemical bonds, Phase rule and phase diagram, Thermo-chemistry, Chemical kinetics and chemical equilibrium, Ionization of water and pH.',
        books: ['Ebbing D., General Chemistry', 'Bahl B.S., Tuli G.D., Essential of Physical Chemistry', 'Haider S.Z., Modern Inorganic Chemistry']
      },
      {
        code: 'CSE1101',
        credits: 3.0,
        title: 'Elementary Structured Programming',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Basic programming concepts and notations; Variables, Constants, Data types; Control Structures; Functions; Arrays, Strings, Records, Pointers, Structures and Linked lists.',
        books: ['Kernighan B. W., Ritchie D. M., The C Programming Language', 'Balagurusamy E., Programming in ANSI C', 'Schildt H., C, The Complete Reference']
      },
      {
        code: 'CSE1102',
        credits: 1.5,
        title: 'Elementary Structured Programming Lab',
        hours: '0-3',
        isSessional: true,
        syllabus: 'Laboratory works and practical implementations based on CSE1101 using ANSI C.',
      },
      {
        code: 'CSE1108',
        credits: 1.5,
        title: 'Introduction to Computer Systems',
        hours: '0-3',
        isSessional: true,
        syllabus: 'Number systems, ASCII code, Bits, Bytes, Computer hardware and software architecture, Operating systems (DOS, Windows, Unix), Internet, Security issues.',
        books: ['Norton P., Introduction to Computers']
      },
    ],
  },
  {
    key: 'y1s2',
    name: 'Year 1, Semester 2',
    shortLabel: '1.2',
    year: 1,
    semester: 2,
    totalCredits: 20.25,
    theoryHours: 15,
    labHours: 10.5,
    courses: [
      {
        code: 'MATH1219',
        credits: 3.0,
        title: 'Mathematics-II (Integral Calculus & Differential Equations)',
        hours: '3-0',
        prerequisite: 'MATH1115',
        syllabus: 'Integral Calculus: Substitution, By parts, Reduction methods, Walli’s formula, Beta & Gamma Function, Area & Volume. Differential Equations: 1st order & higher order linear equations, Operator methods.',
        books: ['Mohammad, Bhattacharjee, Latif, Integral Calculus', 'Howard A., Calculus']
      },
      {
        code: 'ME1211',
        credits: 3.0,
        title: 'Basic Mechanical Engineering',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Kinematics, heat and thermodynamics; Forces in trusses, internal combustion engines, refrigeration; Elements of robotics: rotational motion, grippers.',
        books: ['Gupta J.K., Khurmi R.S., Thermal Engineering', 'John J.C., Introduction To Robotics']
      },
      {
        code: 'ME1214',
        credits: 0.75,
        title: 'Engineering Drawing',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'First and third angle projections, Orthographic drawings, Isometric views, Sectional views.',
      },
      {
        code: 'EEE1241',
        credits: 3.0,
        title: 'Basic Electrical Engineering',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'DC voltage, current, resistance and power; Laws of electrical circuits; Magnetic circuits; AC current, Phasor representation, Three-phase circuits.',
        books: ['Boylestad R.L., Introductory Circuit Analysis', 'Nilsson W., Riedel S.A., Electrical Circuits']
      },
      {
        code: 'EEE1242',
        credits: 1.5,
        title: 'Basic Electrical Engineering Lab',
        hours: '0-3',
        isSessional: true,
        syllabus: 'Laboratory experiments and hardware circuit measurements based on EEE1241.',
      },
      {
        code: 'CSE1200',
        credits: 1.5,
        title: 'Software Development-I',
        hours: '0-3',
        isSessional: true,
        syllabus: 'Software development in groups or individually using structured language with emphasis on strings, files, sound and graphics.',
      },
      {
        code: 'CSE1203',
        credits: 3.0,
        title: 'Discrete Mathematics',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Set Theory, Mathematical logic, Propositional & predicate calculus, Counting principles, Recurrence, Graph Theory, Relations & Functions, Finite automata.',
        books: ['Rosen K. H., Discrete Mathematics and its Applications', 'Liu C.L., Elements of Discrete Mathematics']
      },
      {
        code: 'CSE1205',
        credits: 3.0,
        title: 'Object Oriented Programming',
        hours: '3-0',
        prerequisite: 'CSE1101',
        syllabus: 'Principles of OOP: Classes, Objects, Methods, Constructors, Encapsulation, Polymorphism, Class hierarchy, Inheritance, Overloading and overriding.',
        books: ['Schildt H., Java: The Complete Reference', 'Horstmann Cay S., Big Java: Early Objects', 'Deitel H.M., Java: How to Program']
      },
      {
        code: 'CSE1206',
        credits: 1.5,
        title: 'Object Oriented Programming Lab',
        hours: '0-3',
        isSessional: true,
        syllabus: 'Laboratory works and object-oriented implementations based on CSE1205.',
      },
    ],
  },
  {
    key: 'y2s1',
    name: 'Year 2, Semester 1',
    shortLabel: '2.1',
    year: 2,
    semester: 1,
    totalCredits: 20.25,
    theoryHours: 15,
    labHours: 10.5,
    courses: [
      {
        code: 'HUM2109',
        credits: 3.0,
        title: 'Society, Ethics and Technology',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Historical, Social and Ethical perspectives of technology, Globalization, Human rights, Information technology, Biomedical technology.',
        books: ['Winston M., Edelbach R., Society, Ethics and Technology', 'Charles B. Fledderman, Engineering Ethics']
      },
      {
        code: 'MATH2101',
        credits: 3.0,
        title: 'Mathematics-III (Complex Variable, Laplace Transform & Statistics)',
        hours: '3-0',
        prerequisite: 'MATH1219',
        syllabus: 'Complex Variable: Cauchy-Riemann equations, Conformal mapping, Residue theorem. Laplace Transform: Inverses, ODE solutions. Statistics: Measures of dispersion, Probability distributions, Hypothesis testing.',
        books: ['Brown J.W., Churchill R.V., Complex Variables', 'Spiegel M.R., Laplace Transformations', 'Gupta S.C., Kapoor V.K., Mathematical Statistics']
      },
      {
        code: 'EEE2141',
        credits: 3.0,
        title: 'Electronic Devices and Circuits',
        hours: '3-0',
        prerequisite: 'EEE1241',
        syllabus: 'Semiconductor diode, BJT characteristics, Biasing and thermal stabilization, Small signal models, JFET, MOSFET, CMOS, Oscillators, SCR, TRIAC.',
        books: ['Boylestad R., Nashelskey L., Electronic Devices and Circuit Theory', 'Horenstein M.N., Microelectronic Circuits']
      },
      {
        code: 'EEE2142',
        credits: 1.5,
        title: 'Electronic Devices and Circuits Lab',
        hours: '0-3',
        isSessional: true,
        syllabus: 'Laboratory experiments and hardware breadboard testing based on EEE2141.',
      },
      {
        code: 'CSE2100',
        credits: 0.75,
        title: 'Software Development-II',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Development of software systems using object-oriented languages in teams.',
      },
      {
        code: 'CSE2103',
        credits: 3.0,
        title: 'Data Structures',
        hours: '3-0',
        prerequisite: 'CSE1101',
        syllabus: 'Search efficiency, Arrays, Lists, Stacks, Queues, Graphs, Binary Tree, Threaded Tree, Sorting, Searching, Hashing.',
        books: ['Michael T. Goodrich, Roberto Tamassia, Data Structures and Algorithms in Java', 'Mark Weiss, Data Structures & Algorithm Analysis in C++']
      },
      {
        code: 'CSE2104',
        credits: 1.5,
        title: 'Data Structures Lab',
        hours: '0-3',
        isSessional: true,
        syllabus: 'Implementation of abstract data types, trees, queues, graphs and algorithms based on CSE2103.',
      },
      {
        code: 'CSE2105',
        credits: 3.0,
        title: 'Digital Logic Design',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Boolean algebra, Logic gates, Combinational logic (Adder, Multiplexer, Decoder), Sequential logic (Flip-flops, Counters, Registers), Basic memory cells.',
        books: ['Floyd T.L., Digital Fundamentals', 'Mano M.M., Digital Logic and Computer Design']
      },
      {
        code: 'CSE2106',
        credits: 1.5,
        title: 'Digital Logic Design Lab',
        hours: '0-3',
        isSessional: true,
        syllabus: 'Hardware logic IC circuit design, breadboarding, and simulation based on CSE2105.',
      },
    ],
  },
  {
    key: 'y2s2',
    name: 'Year 2, Semester 2',
    shortLabel: '2.2',
    year: 2,
    semester: 2,
    totalCredits: 19.5,
    theoryHours: 15,
    labHours: 9,
    courses: [
      {
        code: 'MATH2203',
        credits: 3.0,
        title: 'Mathematics-IV (Fourier Analysis, Matrices & Vectors)',
        hours: '3-0',
        prerequisite: 'MATH1115',
        syllabus: 'Fourier Series and Transforms, Matrices (Rank, Eigen values & vectors), Vector algebra, Line/Surface/Volume integrals, Green/Gauss/Stokes theorems.',
        books: ['Anton H., Elementary Linear Algebra', 'Grewall B.S., Higher Engineering Mathematics']
      },
      {
        code: 'CSE2200',
        credits: 0.75,
        title: 'Software Development-III',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Modern industry software development project tackling current trends.',
      },
      {
        code: 'CSE2201',
        credits: 3.0,
        title: 'Numerical Methods',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Non-linear equations (Bisection, Newton-Raphson), Interpolation, Numerical integration, Systems of linear equations (Gauss Elimination, Jordan), ODE solutions.',
        books: ['Rao S.B., Shantha C.K, Numerical Methods With Programs in Basic, Fortran, Pascal & C++']
      },
      {
        code: 'CSE2202',
        credits: 0.75,
        title: 'Numerical Methods Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Programmatic implementations of numerical solvers based on CSE2201.',
      },
      {
        code: 'CSE2207',
        credits: 3.0,
        title: 'Algorithms',
        hours: '3-0',
        prerequisite: 'CSE2103',
        syllabus: 'Algorithmic Complexity, Divide and Conquer, Greedy method, Dynamic programming, Backtracking, Branch and Bound, NP-Completeness.',
        books: ['Cormen T.H., Leiserson C.E., Rivest R.L., Introduction to Algorithms (CLRS)', 'Horawitz E., Sahni S., Computer Algorithms']
      },
      {
        code: 'CSE2208',
        credits: 1.5,
        title: 'Algorithms Lab',
        hours: '0-3',
        isSessional: true,
        syllabus: 'Design, profiling and implementation of graph and dynamic programming algorithms based on CSE2207.',
      },
      {
        code: 'CSE2211',
        credits: 3.0,
        title: 'Data Communication',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Signal encoding, Transmission media, Modems, Multiplexing, Error handling, Switching techniques.',
        books: ['Forouzan B.A., Data Communication and Networking']
      },
      {
        code: 'CSE2213',
        credits: 3.0,
        title: 'Computer Architecture',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Functional units, Bus structures, Instruction sets, Addressing modes, Control Unit (Hardwired & Microprogrammed), Memory organization, Pipelining.',
        books: ['Patterson D. A., Hennessy J. L., Computer Organization & Design', 'Zaky S.G., Hamacher C., Computer Organization']
      },
      {
        code: 'CSE2214',
        credits: 1.5,
        title: 'Assembly Language Programming',
        hours: '0-3',
        isSessional: true,
        syllabus: 'x86 architecture, Registers, Arithmetic & logical instructions, Control transfer, Interrupts, Hardware interfacing.',
        books: ['Irvine K.R., Assembly Language for the IBM PC', 'Yu Y., Marut C., Assembly Language Programming']
      },
    ],
  },
  {
    key: 'y3s1',
    name: 'Year 3, Semester 1',
    shortLabel: '3.1',
    year: 3,
    semester: 1,
    totalCredits: 18.75,
    theoryHours: 15,
    labHours: 7.5,
    courses: [
      {
        code: 'HUM3115',
        credits: 3.0,
        title: 'Economics and Accounting',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Micro & Macro economics, Demand and supply, National income, Cost accounting, Financial statements, Capital budgeting.',
        books: ['Samuelson P.A., Nordhaus W.D., Economics', 'Larson K.D., Fundamentals of Accounting Principles']
      },
      {
        code: 'CSE3100',
        credits: 0.75,
        title: 'Software Development-IV',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Advanced group software engineering projects incorporating database and web backends.',
      },
      {
        code: 'CSE3101',
        credits: 3.0,
        title: 'Mathematical Analysis for Computer Science',
        hours: '3-0',
        prerequisite: 'CSE1203, MATH2101',
        syllabus: 'Recurrence relations, Probability distributions, Markov chains, Queueing systems (M/M/1), Simulation and modelling.',
        books: ['Graham R.L., Knuth D.E., Patashnik O., Concrete Mathematics', 'Ross S.M., Introduction to Probability Models']
      },
      {
        code: 'CSE3103',
        credits: 3.0,
        title: 'Database',
        hours: '3-0',
        prerequisite: 'CSE1203',
        syllabus: 'Data models, ER diagrams, Relational algebra & calculus, SQL, Normalization, Query optimization, Concurrency, Transactions, Indexing & Hashing.',
        books: ['Silberschatz A., Korth H., Sudarshan S., Database System Concepts', 'Elmasri R., Navathe S.B., Fundamentals of Database Systems']
      },
      {
        code: 'CSE3104',
        credits: 1.5,
        title: 'Database Lab',
        hours: '0-3',
        isSessional: true,
        syllabus: 'SQL DDL/DML, PL/SQL stored procedures, indexing and relational database application design.',
      },
      {
        code: 'CSE3109',
        credits: 3.0,
        title: 'Digital System Design',
        hours: '3-0',
        prerequisite: 'CSE2105, CSE2213',
        syllabus: 'Logic Families (TTL, CMOS), Memory subsystems (SRAM, DRAM), ALU design, Control unit design, Computer bus standards.',
        books: ['Mano M.M., Digital Logic and Computer Design', 'Ciletti M.D., Digital Design with Verilog HDL']
      },
      {
        code: 'CSE3110',
        credits: 0.75,
        title: 'Digital System Design Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'FPGA and Verilog HDL system implementation and hardware design experiments.',
      },
      {
        code: 'CSE3117',
        credits: 3.0,
        title: 'Microprocessors and Microcontrollers',
        hours: '3-0',
        prerequisite: 'CSE2105, CSE2213, CSE2214',
        syllabus: 'Microprocessor architecture, Instruction sets, Interfacing I/O devices, DMA, Embedded systems, Microcontrollers (8051 / AVR / ARM).',
        books: ['Gaonkar R.S., Microprocessor Architecture, Programming and Application', 'Barry B. Brey, The Intel Microprocessors']
      },
      {
        code: 'CSE3118',
        credits: 0.75,
        title: 'Microprocessors and Microcontrollers Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Hardware interfacing with sensors, motors, and microcontrollers based on CSE3117.',
      },
    ],
  },
  {
    key: 'y3s2',
    name: 'Year 3, Semester 2',
    shortLabel: '3.2',
    year: 3,
    semester: 2,
    totalCredits: 18.75,
    theoryHours: 15,
    labHours: 7.5,
    courses: [
      {
        code: 'HUM3207',
        credits: 3.0,
        title: 'Industrial Law and Safety Management',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Law of contract, Company law, Labor law, Factory Act, Safety management, Risk assessment, Engineering standards.',
        books: ['Stranks J., Health and Safety Law', 'Malik P.L., Industrial Law']
      },
      {
        code: 'CSE3200',
        credits: 0.75,
        title: 'Software Development-V',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'State-of-the-art software development tools and production-grade engineering documentation.',
      },
      {
        code: 'CSE3201',
        credits: 3.0,
        title: 'Introduction to Computer Networks',
        hours: '3-0',
        prerequisite: 'CSE2211',
        syllabus: 'OSI and TCP/IP models, Data link layer, Sliding window, Routing algorithms, Transport layer (TCP, UDP), Application layer (DNS, HTTP).',
        books: ['Tanenbaum A.S., Computer Networks', 'Forouzan B.A., Data Communications and Networking']
      },
      {
        code: 'CSE3202',
        credits: 0.75,
        title: 'Introduction to Computer Networks Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Socket programming, Packet tracer simulations, and router configuration based on CSE3201.',
      },
      {
        code: 'CSE3207',
        credits: 3.0,
        title: 'Introduction to Artificial Intelligence',
        hours: '3-0',
        prerequisite: 'CSE1203, CSE2207, CSE3101',
        syllabus: 'Knowledge representation, Search strategies, Game playing, Natural language processing, Expert systems, Machine learning concepts.',
        books: ['Russell S. J., Norvig P., Artificial Intelligence: A Modern Approach', 'Patterson D.W., Introduction to Artificial Intelligence']
      },
      {
        code: 'CSE3208',
        credits: 0.75,
        title: 'Introduction to Artificial Intelligence Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Prolog/Python AI search agents, heuristic solvers, and classification based on CSE3207.',
      },
      {
        code: 'CSE3213',
        credits: 3.0,
        title: 'Operating System',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Process management, Concurrency, CPU scheduling, Memory management (Paging, Segmentation), Virtual memory, Deadlocks, File systems.',
        books: ['Silberschatz A., Galvin P.B., Operating System Concepts', 'Tanenbaum A.S., Modern Operating Systems']
      },
      {
        code: 'CSE3214',
        credits: 0.75,
        title: 'Operating System Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Linux shell scripting, POSIX threads, IPC synchronization, and CPU scheduling simulators.',
      },
      {
        code: 'CSE3223',
        credits: 3.0,
        title: 'Information System Design and Software Engineering',
        hours: '3-0',
        prerequisite: 'CSE3103',
        syllabus: 'Systems analysis, Feasibility, UML modeling, Software requirements, Design patterns, Software testing and QA, Project management.',
        books: ['Pressman R.S., Software Engineering', 'Sommerville I., Software Engineering']
      },
      {
        code: 'CSE3224',
        credits: 0.75,
        title: 'Information System Design and Software Engineering Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'UML CASE tools, sprint management, integration testing, and documentation based on CSE3223.',
      },
    ],
  },
  {
    key: 'y4s1',
    name: 'Year 4, Semester 1',
    shortLabel: '4.1',
    year: 4,
    semester: 1,
    totalCredits: 21.0,
    theoryHours: 15,
    labHours: 12,
    courses: [
      {
        code: 'IPE4111',
        credits: 3.0,
        title: 'Industrial Management',
        hours: '3-0',
        prerequisite: 'Nil',
        syllabus: 'Management theory, Personnel management, Production forecasting, Material Requirements Planning, Financial management, Breakeven analysis.',
        books: ['Griffin R.W., Management', 'Taylor B.W., Introduction to Management Science']
      },
      {
        code: 'CSE4100',
        credits: 3.0,
        title: 'Project and Thesis-I',
        hours: '0-6',
        isSessional: true,
        syllabus: 'Research and innovative computer engineering capstone project under faculty supervision.',
      },
      {
        code: 'CSE4113',
        credits: 3.0,
        title: 'Pattern Recognition and Machine Learning',
        hours: '3-0',
        prerequisite: 'MATH2203, CSE3207',
        syllabus: 'Feature selection, Bayesian classifiers, Neural networks, Deep learning, Decision trees, Support vector machines, Cluster analysis.',
        books: ['Theodoridis S., Pattern Recognition', 'Murphy, Kevin P., Machine Learning: A Probabilistic Perspective']
      },
      {
        code: 'CSE4114',
        credits: 0.75,
        title: 'Pattern Recognition and Machine Learning Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Implementation of ML classifiers, regression, and clustering algorithms based on CSE4113.',
      },
      {
        code: 'CSE4129',
        credits: 3.0,
        title: 'Formal Languages and Compilers',
        hours: '3-0',
        prerequisite: 'CSE1203',
        syllabus: 'Finite automata, Context-free grammars, Lexical analysis, Top down and bottom up parsing, Symbol tables, Intermediate code generation, Optimization.',
        books: ['Aho A. V., Lam M. S., Sethi R., Ullman J. D., Compilers (Dragon Book)', 'Hopcroft J. E., Automata Theory']
      },
      {
        code: 'CSE4130',
        credits: 0.75,
        title: 'Formal Languages and Compilers Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Lex/Flex and Yacc/Bison compiler construction and AST generation based on CSE4129.',
      },
      {
        code: 'CSE4141',
        credits: 3.0,
        title: 'Option-I: Data Warehousing and Mining',
        hours: '3-0',
        prerequisite: 'CSE3103',
        syllabus: 'Data cube, OLAP, Apriori algorithm, Mining association rules, Sequential patterns, Clustering.',
        books: ['Han J., Kamber M., Data Mining: Concepts and Techniques']
      },
      {
        code: 'CSE4142',
        credits: 0.75,
        title: 'Option-I Lab: Data Warehousing and Mining Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'ETL pipelines, data cube generation, and mining pattern algorithms based on CSE4141.',
      },
      {
        code: 'CSE4173',
        credits: 3.0,
        title: 'Option-II: Cyber Security',
        hours: '3-0',
        prerequisite: 'CSE2211, CSE3201',
        syllabus: 'Cryptography (AES, RSA), Digital signatures, Firewalls, VPN, Intrusion detection, Network security.',
        books: ['Stallings W., Cryptography and Network Security']
      },
      {
        code: 'CSE4174',
        credits: 0.75,
        title: 'Option-II Lab: Cyber Security Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Security audits, penetration testing tools, and cryptographic implementations based on CSE4173.',
      },
    ],
  },
  {
    key: 'y4s2',
    name: 'Year 4, Semester 2',
    shortLabel: '4.2',
    year: 4,
    semester: 2,
    totalCredits: 17.25,
    theoryHours: 12,
    labHours: 10.5,
    courses: [
      {
        code: 'CSE4203',
        credits: 3.0,
        title: 'Computer Graphics',
        hours: '3-0',
        prerequisite: 'MATH2203',
        syllabus: 'Scan conversion, 2D/3D viewing and transformations, B-Splines, Hidden line elimination, Raster graphics, Shading and illumination.',
        books: ['Shirley P., Marschner S., Fundamentals of Computer Graphics', 'Foley J. D., Computer Graphics: Principles and Practice']
      },
      {
        code: 'CSE4204',
        credits: 0.75,
        title: 'Computer Graphics Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'OpenGL shaders, 3D rendering and graphic animation based on CSE4203.',
      },
      {
        code: 'CSE4250',
        credits: 3.0,
        title: 'Project and Thesis-II',
        hours: '0-6',
        isSessional: true,
        syllabus: 'Final thesis dissertation defence and working software engineering system presentation.',
      },
      {
        code: 'CSE4227',
        credits: 3.0,
        title: 'Option-III: Digital Image Processing',
        hours: '3-0',
        prerequisite: 'CSE4203',
        syllabus: 'Image filtering, Fourier transforms, Edge detection, Image compression, Morphological operations.',
        books: ['Gonzalez R.C., Woods R.E., Digital Image Processing']
      },
      {
        code: 'CSE4228',
        credits: 0.75,
        title: 'Option-III Lab: Digital Image Processing Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Image processing filters and computer vision experiments based on CSE4227.',
      },
      {
        code: 'CSE4263',
        credits: 3.0,
        title: 'Option-IV: Internet of Things (IoT)',
        hours: '3-0',
        prerequisite: 'CSE3211',
        syllabus: 'IoT Architecture, Sensor networks, Raspberry Pi & Arduino, Cloud/Fog computing, MQTT protocols.',
        books: ['Buyya R., Internet of Things: Principles and Paradigms']
      },
      {
        code: 'CSE4264',
        credits: 0.75,
        title: 'Option-IV Lab: Internet of Things Lab',
        hours: '0-3/2',
        isSessional: true,
        syllabus: 'Microcontroller hardware sensors and IoT cloud telemetry dashboards based on CSE4263.',
      },
      {
        code: 'CSE4267',
        credits: 3.0,
        title: 'Option-V: Cloud Computing',
        hours: '3-0',
        prerequisite: 'CSE3207',
        syllabus: 'Public/private/hybrid clouds, Virtualization, Containers, Distributed storage, Serverless architectures, Scalability.',
        books: ['Buyya R., Cloud Computing: Principles and Paradigms']
      },
    ],
  },
];

// Flat dictionary of all courses and their credits
export const COURSE_CREDITS_MAP: Record<string, number> = {};
export const COURSE_INFO_MAP: Record<string, CourseInfo> = {};

for (const sem of ALL_SEMESTERS_CURRICULUM) {
  for (const c of sem.courses) {
    COURSE_CREDITS_MAP[c.code] = c.credits;
    COURSE_INFO_MAP[c.code] = c;
  }
}

// Get credits for any course (default 3.0 if unspecified)
export const getCourseCredits = (courseCode: string): number => {
  const norm = courseCode.trim().toUpperCase();
  return COURSE_CREDITS_MAP[norm] ?? 3.0;
};

// Check if a course is a lab/sessional course
export const isCourseSessional = (courseCode: string): boolean => {
  const norm = courseCode.trim().toUpperCase();
  const info = COURSE_INFO_MAP[norm];
  if (info) return !!info.isSessional;
  return false;
};

// Default customizable assessment breakdown for lab/sessional courses (sum = 100)
export const DEFAULT_LAB_ASSESSMENT_ITEMS: LabAssessmentItem[] = [
  { id: 'lab_1', name: 'Lab Performance & Attendance', marksObtained: null, maxMarks: 10 },
  { id: 'lab_2', name: 'Lab Reports / Assignments', marksObtained: null, maxMarks: 20 },
  { id: 'lab_3', name: 'Lab Quizzes / Mid Assessment', marksObtained: null, maxMarks: 20 },
  { id: 'lab_4', name: 'Final Lab Exam & Viva', marksObtained: null, maxMarks: 50 },
];

// Retrieve prior semesters for any given semester key
export const getPriorSemesters = (currentSemesterKey: string): SemesterCurriculum[] => {
  const targetIndex = ALL_SEMESTERS_CURRICULUM.findIndex(s => s.key === currentSemesterKey);
  if (targetIndex <= 0) return [];
  return ALL_SEMESTERS_CURRICULUM.slice(0, targetIndex);
};

// Map year and semester numbers (e.g. 2, 2) to key (e.g. 'y2s2')
export const getSemesterKeyFromYearSem = (year: number, semester: number): string => {
  return `y${year}s${semester}`;
};

// Official Year 1 Semester 1 Routine (Day by day, courses only - no specific times)
export const ROUTINE_1_1 = {
  saturday: ['CSE1101', 'MATH1115', 'PHY1115', 'CSE1102'],
  sunday: ['CHEM1115', 'HUM1107', 'MATH1115', 'PHY1116'],
  monday: ['CSE1101', 'PHY1115', 'CHEM1115', 'HUM1108'],
  tuesday: ['MATH1115', 'CHEM1115', 'HUM1107', 'CSE1108'],
  wednesday: ['CSE1101', 'PHY1115', 'HUM1107'],
  thursday: [],
  friday: [],
};

// Preset day-by-day routines for each semester
export const SEMESTER_ROUTINE_PRESETS: Record<string, Record<string, string[]>> = {
  y1s1: ROUTINE_1_1,
  y1s2: {
    saturday: ['CSE1203', 'MATH1219', 'EEE1241', 'CSE1200'],
    sunday: ['ME1211', 'CSE1205', 'MATH1219', 'ME1214'],
    monday: ['CSE1203', 'EEE1241', 'CSE1205', 'EEE1242'],
    tuesday: ['ME1211', 'MATH1219', 'CSE1203', 'CSE1206'],
    wednesday: ['EEE1241', 'ME1211', 'CSE1205'],
    thursday: [],
    friday: [],
  },
  y2s1: {
    saturday: ['CSE2103', 'CSE2105', 'MATH2101', 'CSE2104'],
    sunday: ['EEE2141', 'HUM2109', 'MATH2101', 'EEE2142'],
    monday: ['CSE2103', 'CSE2105', 'EEE2141', 'CSE2106'],
    tuesday: ['MATH2101', 'HUM2109', 'CSE2103', 'CSE2100'],
    wednesday: ['CSE2105', 'EEE2141', 'HUM2109'],
    thursday: [],
    friday: [],
  },
  y2s2: {
    saturday: ['CSE2201', 'CSE2207', 'MATH2203', 'CSE2200'],
    sunday: ['CSE2211', 'CSE2213', 'MATH2203', 'CSE2202'],
    monday: ['CSE2201', 'CSE2207', 'CSE2211', 'CSE2208'],
    tuesday: ['CSE2213', 'MATH2203', 'CSE2201', 'CSE2214'],
    wednesday: ['CSE2207', 'CSE2211', 'CSE2213'],
    thursday: [],
    friday: [],
  },
  y3s1: {
    saturday: ['CSE3101', 'CSE3103', 'HUM3115', 'CSE3100'],
    sunday: ['CSE3109', 'CSE3117', 'HUM3115', 'CSE3104'],
    monday: ['CSE3101', 'CSE3103', 'CSE3109', 'CSE3110'],
    tuesday: ['CSE3117', 'HUM3115', 'CSE3101', 'CSE3118'],
    wednesday: ['CSE3103', 'CSE3109', 'CSE3117'],
    thursday: [],
    friday: [],
  },
  y3s2: {
    saturday: ['CSE3201', 'CSE3207', 'HUM3207', 'CSE3200'],
    sunday: ['CSE3213', 'CSE3223', 'HUM3207', 'CSE3202'],
    monday: ['CSE3201', 'CSE3207', 'CSE3213', 'CSE3208'],
    tuesday: ['CSE3223', 'HUM3207', 'CSE3201', 'CSE3214'],
    wednesday: ['CSE3207', 'CSE3213', 'CSE3223', 'CSE3224'],
    thursday: [],
    friday: [],
  },
};

// Default routine based on Year 1 Semester 1 courses (as requested)
export const DEFAULT_REAL_WEEKLY_ROUTINE = ROUTINE_1_1;
