export interface LocalAgentResult {
  agent: string;
  output: string;
  executionTime: number;
}

export interface LocalBlueprintData {
  title: string;
  summary: string;
  problemStatement: string;
  research: string; // Keep for type backward compatibility, will be ignored in UI rendering
  feasibility: string;
  innovation: string;
  patentDocument: string;
  agentResults: LocalAgentResult[];
}

/**
 * Classifies the raw idea to detect its primary engineering domain.
 */
const detectDomain = (idea: string): "healthcare" | "iot" | "energy" | "software" | "general" => {
  const normalized = idea.toLowerCase();
  
  const healthcareKeywords = [
    "health", "medical", "patient", "clinic", "doctor", "bio", "dna", "disease", 
    "drug", "hospital", "therapy", "hydrate", "hydration", "water bottle", "medicine", 
    "biometric", "glucose", "insulin", "blood", "care", "wellness", "fitness"
  ];
  
  const iotKeywords = [
    "smart", "iot", "sensor", "device", "hardware", "network", "connected", "wireless", 
    "tracking", "telemetry", "lpwan", "mqtt", "bluetooth", "node", "automation", "rfid",
    "embed", "firmware", "controller"
  ];
  
  const energyKeywords = [
    "energy", "solar", "wind", "power", "green", "clean", "environment", "carbon", 
    "battery", "recycle", "climate", "grid", "thermal", "turbine", "heating", "electric",
    "fuel", "utility", "waste", "conservation"
  ];
  
  const softwareKeywords = [
    "software", "ai", "ml", "platform", "app", "algorithm", "database", "web", 
    "blockchain", "crypto", "security", "saas", "api", "cloud", "server", "learning"
  ];
  
  if (healthcareKeywords.some(k => normalized.includes(k))) return "healthcare";
  if (iotKeywords.some(k => normalized.includes(k))) return "iot";
  if (energyKeywords.some(k => normalized.includes(k))) return "energy";
  if (softwareKeywords.some(k => normalized.includes(k))) return "software";
  
  return "general";
};

/**
 * Dynamically generates shorter, domain-specific, dynamic invention blueprints.
 */
export const generateLocalBlueprint = (idea: string): LocalBlueprintData => {
  const cleanInput = idea.trim().replace(/[\n\r]+/g, " ");
  const domain = detectDomain(cleanInput);
  
  // Extract custom descriptive nouns to weave a unique title
  const words = cleanInput.split(/\s+/).filter(w => w.length > 2);
  const stopWords = new Set(["the", "and", "for", "with", "that", "this", "from", "into", "your", "based", "system", "device"]);
  const keywords = words
    .map(w => w.replace(/[^a-zA-Z]/g, ""))
    .filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()))
    .slice(0, 3);
    
  let rawTitle = keywords
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
    
  if (!rawTitle) {
    rawTitle = domain === "healthcare" ? "Clinical Biometric" :
               domain === "iot" ? "Smart Sensor" :
               domain === "energy" ? "Eco Thermal" :
               domain === "software" ? "Autonomous Core" : "Consumer Utility";
  }

  let title = "";
  let summary = "";
  let problemStatement = "";
  let innovation = "";
  let feasibility = "";
  let patentDocument = "";

  // DOMAIN-SPECIFIC CONTENT GENERATION
  switch (domain) {
    case "healthcare":
      title = `Smart ${rawTitle} Monitoring System`;
      summary = `A targeted patient wellness solution that uses physiological sensors to track ${cleanInput.toLowerCase()} and provide real-time updates directly to healthcare providers.`;
      
      problemStatement = `In wellness monitoring, accurate diagnostic telemetry is often delayed by manual recording or user forgetfulness. This is especially true for managing ${cleanInput.toLowerCase()}, where delays in identifying adverse physical markers can result in acute symptoms. Existing monitoring tools are too clinical for home use, causing low user compliance. This system addresses this gap by integrating seamlessly into daily life.`;
      
      innovation = `This system directly derives its value from combining personal user habits with clinical-grade biometric feedback. It operates a closed-loop feedback mechanism that alerts the patient through haptic cues and syncs telemetry securely with clinical EHRs via encrypted channels, ensuring high compliance and precise preventative updates.`;
      
      feasibility = `The application is highly practical and relies on off-the-shelf low-energy biometrics. The software backend runs on simple serverless threads that secure medical records without requiring dedicated processing servers, making it achievable for a prototype build in 3-5 weeks.`;
      
      patentDocument = `CLINICAL TELEMETRY APPLICATION

ABSTRACT:
A system for tracking ${cleanInput.toLowerCase()} consisting of a body-worn sensor housing and an edge processor.

DETAILED DESCRIPTION:
The body-worn sensor tracks real-time biological telemetry. When biometric parameters cross safe levels, haptic alerts trigger locally and diagnostic logs are pushed via secure API to emergency healthcare portals.

CONCISE CLAIMS:
1. A wearable diagnostic system comprising a biometric sensor mapping clinical parameters and a local edge controller.
2. The wearable system of Claim 1, wherein biometric thresholds dynamically adjust based on historical user parameters.
3. The system of Claim 1, wherein diagnostic records are pushed directly to an encrypted electronic health record database.`;
      break;

    case "iot":
      title = `${rawTitle} Smart Connected Network`;
      summary = `A decentralized hardware and software network that coordinates edge sensors to monitor and automate ${cleanInput.toLowerCase()} with minimal power drain.`;
      
      problemStatement = `Smart automation setups suffer from high battery drain and communication delays when monitoring ${cleanInput.toLowerCase()}. Standard continuous logging setups drain sensor batteries within weeks, and centralized controllers drop connections when processing multiple streams. This hardware system automates local edge triggers to optimize node sleep cycles.`;
      
      innovation = `The specific breakthrough lies in the automated local decision mapping. Instead of pushing raw telemetry continually to the cloud, the sensor node evaluates data patterns locally. It uses low-power LPWAN protocols to notify administrators only when a preset tolerance boundary is crossed.`;
      
      feasibility = `This hardware framework is highly practical. It utilizes standard microcontroller components and LPWAN modules that consume micro-amps in standby mode. A working field prototype can be engineered and assembled in under a month using standard embedded software.`;
      
      patentDocument = `DISTRIBUTED SENSOR APPLICATION

ABSTRACT:
A low-power network for automating ${cleanInput.toLowerCase()} utilizing edge computing nodes and threshold triggers.

DETAILED DESCRIPTION:
The system comprises a network of low-power microcontrollers equipped with local analog sensors. The controllers operate primarily in deep-sleep mode, waking periodically to sample local inputs. If anomalies are detected, active RF states are triggered.

CONCISE CLAIMS:
1. A decentralized sensor network comprising a micro-controller, an analog telemetry receiver, and an LPWAN transmitter.
2. The network of Claim 1, wherein the controller keeps the transceiver in a powered-off standby state until local thresholds are reached.
3. The network of Claim 1, wherein edge telemetry is aggregated locally before packet transmission to conserve battery.`;
      break;

    case "energy":
      title = `${rawTitle} Clean Energy Optimizer`;
      summary = `A clean-tech utility system designed to optimize energy conversion, reduce waste, and manage the grid efficiency of ${cleanInput.toLowerCase()}.`;
      
      problemStatement = `Contemporary energy storage and utility grids struggle with transmission losses and poor load balancing when integrating ${cleanInput.toLowerCase()}. Existing architectures rely on centralized fossil power plants and cannot easily route variable power outputs dynamically, leading to significant thermal waste and grid instability during peak hours.`;
      
      innovation = `The unique element is the thermodynamic distribution algorithm. The system dynamically measures local energy consumption rates and routes excess green power directly to high-capacity storage buffers. This mitigates peak surge bounds and reduces conversion grid waste in real time.`;
      
      feasibility = `The system is highly practical for utility operators. It utilizes standard grid-balancing protocols and solid-state battery relays, meaning no new exotic materials are required. Initial modeling and grid testing can be set up in 5-7 weeks.`;
      
      patentDocument = `UTILITY GRID POWER APPLICATION

ABSTRACT:
A system for managing transmission efficiency of ${cleanInput.toLowerCase()} using load-balancing battery relays.

DETAILED DESCRIPTION:
The power grid utilizes grid telemetry inputs to balance energy loads. During low-demand phases, excess clean power is captured in solid-state buffers and subsequently discharged when local consumption rates exceed default capacities.

CONCISE CLAIMS:
1. An energy load balancer comprising a grid telemetry receiver, a solid-state battery relay, and a local load router.
2. The load balancer of Claim 1, wherein the load router dynamically diverts grid energy based on local consumption limits.
3. The load balancer of Claim 1, wherein battery relays are managed sequentially to optimize grid degradation rates.`;
      break;

    case "software":
      title = `Autonomous ${rawTitle} Processing Platform`;
      summary = `A secure software platform that uses lightweight database queries and local edge routing to run and analyze ${cleanInput.toLowerCase()} in real time.`;
      
      problemStatement = `Conventional software platforms handling ${cleanInput.toLowerCase()} suffer from high processing delays and heavy cloud server overhead. Centrally hosted APIs drop active payloads when user traffic spikes, and traditional database structures are too rigid to scale with complex unstructured inputs, resulting in slow query runs and high server bills.`;
      
      innovation = `The core software innovation is the lightweight, asynchronous database pipeline. The software processes user inputs in clean edge threads, executing local validation before committing changes. This minimizes network latency and keeps API transactions fast and inexpensive.`;
      
      feasibility = `This system is highly practical and extremely cost-effective. Built on lightweight serverless functions and modern database runtimes, the entire cloud infrastructure can be developed and launched by a single developer in 2-3 weeks.`;
      
      patentDocument = `ASYNCHRONOUS SOFTWARE PLATFORM APPLICATION

ABSTRACT:
A software platform for processing ${cleanInput.toLowerCase()} via asynchronous edge routes.

DETAILED DESCRIPTION:
The platform captures user transaction requests, routes them to Deno serverless edge threads, validates inputs locally using lightweight schemas, and updates a distributed database asynchronously to guarantee fast responses.

CONCISE CLAIMS:
1. An asynchronous processing platform comprising an edge runtime processor, an input validation router, and a database synchronizer.
2. The platform of Claim 1, wherein input schemas are parsed in edge threads before database commits.
3. The platform of Claim 1, wherein data synchronization is queued in local caches to maintain application availability during grid latency.`;
      break;

    default:
      title = `${rawTitle} Utility Architecture`;
      summary = `A simple, user-friendly consumer utility system that automates and coordinates the execution of ${cleanInput.toLowerCase()} in everyday environments.`;
      
      problemStatement = `Standard setups for managing ${cleanInput.toLowerCase()} are overly complex and require expensive industrial controllers or manual oversight. This makes regular everyday execution inefficient and error-prone, frustrating everyday users who need a clean, simple, and self-contained tool.`;
      
      innovation = `The unique point of this invention is its self-contained mechanical design. It strips away complicated configurations, utilizing simple hardware toggles and standard interfaces to achieve high reliability and automation for home and consumer use.`;
      
      feasibility = `This utility system is exceptionally practical. It uses accessible consumer components and simple mechanical parts, allowing physical prototypes to be built, tested, and ready for demo within 2 weeks at a minimal cost.`;
      
      patentDocument = `CONSUMER UTILITY SPECIFICATION

ABSTRACT:
A consumer-friendly apparatus for managing ${cleanInput.toLowerCase()} utilizing mechanical triggers.

DETAILED DESCRIPTION:
The apparatus comprises a self-contained housing and standard mechanical switches. It operates locally without complex network setups, automating task execution securely through physical parameters.

CONCISE CLAIMS:
1. A consumer utility apparatus comprising a self-contained housing, a physical sensor trigger, and a local mechanical relay.
2. The apparatus of Claim 1, wherein the sensor trigger operates independently of external network servers.
3. The apparatus of Claim 1, wherein the local relay executes mechanical adjustments based on physical threshold limits.`;
      break;
  }

  return {
    title,
    summary,
    problemStatement,
    research: "Research data removed from active display.", // Ignore in UI, keep for type compatibility
    feasibility,
    innovation,
    patentDocument,
    agentResults: [
      { agent: "ideaIntake", output: `Title: ${title}\nOverview: ${summary}`, executionTime: 120 },
      { agent: "problem", output: problemStatement, executionTime: 150 },
      { agent: "research", output: "Research analysis bypassed.", executionTime: 50 },
      { agent: "feasibility", output: feasibility, executionTime: 140 },
      { agent: "innovation", output: innovation, executionTime: 160 },
      { agent: "patentWriter", output: patentDocument, executionTime: 210 }
    ]
  };
};
