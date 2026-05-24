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
 * Extracts the natural core topic from an idea by stripping generic system wrappers,
 * prefixes, and suffixes to prevent awkward double-system formulations.
 * Example: "Smart Suicide Detection System" -> "suicide-related distress indicators"
 */
const getCoreTopic = (idea: string): string => {
  let topic = idea.trim().toLowerCase();
  
  // Clean punctuation and double spaces
  topic = topic.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, " ");

  // Strip generic prefix wrappers
  topic = topic.replace(/^(a|an|the|smart|autonomous|advanced|system\s+for|device\s+for|platform\s+for|method\s+of|automated|real-time|real\s+time|distributed|connected)\s+/gi, "");
  
  // Strip generic suffix wrappers
  topic = topic.replace(/\s+(system|device|platform|network|app|tracker|detector|detection|machine|framework|architecture|hardware|software|tool|utility|apparatus)$/gi, "");
  
  // Custom adjustments for specific clinical safety cases
  if (topic === "suicide" || topic === "suicidal") {
    return "physiological distress and suicidal crisis indicators";
  }
  
  return topic || idea.trim().toLowerCase();
};

/**
 * Classifies the raw idea to detect its primary engineering domain,
 * checking high-sensitivity clinical/healthcare parameters first in the priority queue.
 */
const detectDomain = (idea: string): "healthcare" | "energy" | "software" | "iot" | "general" => {
  const normalized = idea.toLowerCase();
  
  // 1. Healthcare / Biotech / Biometric Safety (Highest Priority)
  const healthcareKeywords = [
    "suicide", "depression", "mental", "heart", "pulse", "respir", "biometric", "health",
    "medical", "patient", "clinic", "doctor", "bio", "dna", "disease", "drug", "hospital",
    "therapy", "hydrate", "hydration", "water bottle", "medicine", "glucose", "insulin", "blood",
    "physiolog", "autonomic", "wellness", "fitness", "body"
  ];
  if (healthcareKeywords.some(k => normalized.includes(k))) return "healthcare";
  
  // 2. CleanTech & Green Energy / Utilities (Medium-High Priority)
  const energyKeywords = [
    "energy", "solar", "wind", "power", "green", "clean", "environment", "carbon", 
    "battery", "recycle", "climate", "grid", "thermal", "turbine", "heating", "electric",
    "fuel", "utility", "waste", "conservation", "thermodynamic"
  ];
  if (energyKeywords.some(k => normalized.includes(k))) return "energy";
  
  // 3. Software Architectures & Algorithms / Platforms (Medium Priority)
  const softwareKeywords = [
    "software", "ai", "ml", "platform", "app", "algorithm", "database", "web", 
    "blockchain", "crypto", "security", "saas", "api", "cloud", "server", "learning",
    "transaction", "ledger", "programming"
  ];
  if (softwareKeywords.some(k => normalized.includes(k))) return "software";
  
  // 4. IoT & Hardware Sensor Nodes (Fallback Priority)
  const iotKeywords = [
    "smart", "iot", "sensor", "device", "hardware", "network", "connected", "wireless", 
    "tracking", "telemetry", "lpwan", "mqtt", "bluetooth", "node", "automation", "rfid",
    "embed", "firmware", "controller"
  ];
  if (iotKeywords.some(k => normalized.includes(k))) return "iot";
  
  return "general";
};

/**
 * Dynamically generates short, natural, domain-specific, and highly customized blueprints.
 */
export const generateLocalBlueprint = (idea: string): LocalBlueprintData => {
  const cleanInput = idea.trim().replace(/[\n\r]+/g, " ");
  const domain = detectDomain(cleanInput);
  const coreTopic = getCoreTopic(cleanInput);
  
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
      title = `${rawTitle} Biometric Safety Monitor`;
      summary = `A non-invasive clinical safety monitor designed to continuously observe physiological parameters to identify early markers of ${coreTopic} and alert authorized caregivers immediately.`;
      
      problemStatement = `Evaluating patient wellness and managing ${coreTopic} is traditionally restricted to periodic self-reporting or in-clinic clinical evaluations. Unfortunately, acute distress spikes occur unpredictably in home environments, leaving family and emergency response teams unaware until a crisis has already occurred. This biometric monitor captures real-time physiological indicators to provide a protective, continuous safety net.`;
      
      innovation = `The breakthrough lies in local behavioral and autonomic telemetry integration. By continuously mapping heart rate variability, skin conductance, and motion patterns on-device, it accurately distinguishes physical exertion from autonomic panic or emotional crisis. This allows the system to initiate local haptic grounding prompts and dispatch emergency coordinates securely without relying on continuous, privacy-compromising cloud telemetry.`;
      
      feasibility = `This system is highly practical, combining consumer smartwatch biometrics with a lightweight local processing script. Prototyping can be achieved within 3-4 weeks using standard wearable sensor APIs, ensuring a functional, secure, and clinical-grade baseline.`;
      
      patentDocument = `BIOMETRIC PROTECTION APPARATUS SPECIFICATION

ABSTRACT:
A wearable biometric apparatus that tracks physiological distress markers related to ${coreTopic} to trigger local grounding haptics and remote emergency coordinates.

DETAILED DESCRIPTION:
The wearable housing includes a heart-rate monitor, a galvanic skin response sensor, and a local processor. Telemetry is evaluated locally against dynamic baseline limits. If biometric spikes match crisis markers, encrypted alerts are dispatched to a primary emergency contact.

CONCISE CLAIMS:
1. A wearable biometric safety monitor comprising a body-worn housing, a physiological sensor tracking autonomic indicators, and a local processor.
2. The monitor of Claim 1, wherein emergency alerts are bypassed if local haptic grounding prompts are successfully acknowledged by the user.
3. The monitor of Claim 1, wherein biometric thresholds are calibrated dynamically based on the patient's resting baseline sleep states.`;
      break;

    case "iot":
      title = `${rawTitle} Smart Connected System`;
      summary = `A decentralized edge sensor node architecture designed to automate the tracking and optimization of ${coreTopic} while minimizing battery consumption.`;
      
      problemStatement = `Continuous field telemetry for tracking ${coreTopic} typically drains device batteries within weeks, requiring frequent maintenance. Centralized networks also drop active streams when hundreds of sensors broadcast continuously. This system deploys smart local triggers to keep sensor nodes in deep sleep until an anomaly boundary is crossed.`;
      
      innovation = `The primary innovation is the automated node sleep-coordination algorithm. Rather than broadcasting telemetry endlessly to a central controller, the node samples values locally and remains in micro-amp standby, waking its radio transceiver only when parameters drift outside of standard tolerances.`;
      
      feasibility = `The framework is extremely practical. It utilizes low-power microcontrollers and LPWAN transceivers that cost under $15 in parts. A fully functional field prototype can be engineered and assembled within a month.`;
      
      patentDocument = `DISTRIBUTED EDGE TELEMETRY SPECIFICATION

ABSTRACT:
A low-power sensor node network that automates ${coreTopic} using edge threshold controllers.

DETAILED DESCRIPTION:
The network comprises microcontrollers operating primarily in deep-sleep mode. Analog sensors sample parameters periodically. RF transmitters are powered down, active only when local parameters cross designated boundaries.

CONCISE CLAIMS:
1. A decentralized sensor network comprising a microcontroller, a local analog sensor tracking ${coreTopic}, and an LPWAN transceiver.
2. The network of Claim 1, wherein the transceiver remains powered off until local thresholds are breached.
3. The network of Claim 1, wherein edge telemetry packets are compressed locally before transmission.`;
      break;

    case "energy":
      title = `${rawTitle} Grid Energy Optimizer`;
      summary = `A clean-tech utility controller designed to balance load demands and optimize grid transmission efficiency for ${coreTopic}.`;
      
      problemStatement = `Energy utility grids face major transmission losses and balancing challenges when managing ${coreTopic}. Existing infrastructures rely on centralized distribution nodes and are unable to route variable clean energy outputs dynamically, causing thermal waste and battery degradation during peak surges.`;
      
      innovation = `The specific breakthrough is the thermodynamic load-balancing router. It dynamically measures utility demand curves locally and diverts excess clean power to active storage buffers in real time, preventing thermal grids from overloading and eliminating surge waste.`;
      
      feasibility = `The system is highly practical for commercial grid integration. It utilizes standard utility hardware relays and digital load balancers, making a prototype modeling and grid-sync test achievable within 5 weeks.`;
      
      patentDocument = `GRID UTILITY BALANCER SPECIFICATION

ABSTRACT:
A grid load balancer that manages transmission optimization for ${coreTopic} using battery relays.

DETAILED DESCRIPTION:
The grid balancer tracks variable energy input telemetry. Excess power is routed to local solid-state battery relays, and grid discharge schedules are dynamically shifted to match peak consumption curves.

CONCISE CLAIMS:
1. A grid load balancer comprising a utility telemetry receiver, a solid-state battery relay, and a local routing processor managing ${coreTopic}.
2. The load balancer of Claim 1, wherein the routing processor dynamically diverts clean grid energy during peak generation curves.
3. The load balancer of Claim 1, wherein battery relays are managed in a rolling sequence to optimize cell degradation rates.`;
      break;

    case "software":
      title = `${rawTitle} Decentralized Software Core`;
      summary = `A high-performance software platform designed to process and validate ${coreTopic} in real time using secure, serverless edge threads.`;
      
      problemStatement = `Traditional enterprise platforms handling ${coreTopic} suffer from severe processing lag and expensive server fees under load. Centralized database architectures bottleneck when transactions spike, causing dropped API payloads and slow validation runs that halt user actions.`;
      
      innovation = `The core software innovation is the lightweight, asynchronous database pipeline. The software processes user inputs in clean edge threads, executing local validation before committing changes. This minimizes network latency and keeps API transactions fast and inexpensive.`;
      
      feasibility = `This system is highly practical and cost-effective. Built on lightweight serverless functions and modern database runtimes, the entire cloud infrastructure can be developed and launched by a single developer in 2-3 weeks.`;
      
      patentDocument = `ASYNCHRONOUS COMPILING INTERFACE SPECIFICATION

ABSTRACT:
A high-performance software platform that processes ${coreTopic} using secure serverless validation routes.

DETAILED DESCRIPTION:
The platform captures transaction payloads, executes schema validation on serverless edge threads, and updates a distributed state ledger asynchronously to maintain sub-millisecond responsiveness.

CONCISE CLAIMS:
1. An asynchronous processing platform comprising an edge runtime processor, an input validation router mapping ${coreTopic}, and a database synchronizer.
2. The platform of Claim 1, wherein transaction schemas are validated at edge routes before database commits.
3. The platform of Claim 1, wherein data updates are queued in localized caches to maintain availability during network latency.`;
      break;

    default:
      title = `${rawTitle} Consumer Utility`;
      summary = `A simple, self-contained mechanical utility system designed to automate the coordination and execution of ${coreTopic} in consumer environments.`;
      
      problemStatement = `Standard setups for managing ${coreTopic} are typically overly complex and require expensive industrial controllers or manual oversight. This makes regular everyday execution inefficient and error-prone, frustrating everyday users who need a clean, simple, and self-contained tool.`;
      
      innovation = `The unique breakthrough is the self-contained mechanical trigger design. It strips away expensive electronic sensors, utilizing simple physical toggles and gravity-fed sorting trays to achieve high reliability and automation for home and consumer use.`;
      
      feasibility = `This utility is exceptionally practical. It uses accessible consumer-grade parts and simple mechanical actions, allowing physical prototypes to be built and demonstrated within 2 weeks at a minimal cost.`;
      
      patentDocument = `MECHANICAL UTILITY APPARATUS SPECIFICATION

ABSTRACT:
A consumer-friendly apparatus for managing ${coreTopic} utilizing physical sorting triggers.

DETAILED DESCRIPTION:
The apparatus includes a self-contained housing and standard mechanical switches. It automates sorting locally without network dependencies, executing task cycles securely through physical parameters.

CONCISE CLAIMS:
1. A consumer utility apparatus comprising a self-contained housing, a physical sensor trigger mapping ${coreTopic}, and a local mechanical relay.
2. The apparatus of Claim 1, wherein the sensor trigger operates independently of external cloud connection servers.
3. The apparatus of Claim 1, wherein the local relay executes sorting adjustments based on physical load thresholds.`;
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
