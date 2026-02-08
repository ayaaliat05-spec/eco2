import { EcoBranch } from './types';

// The system instruction matching the Eco persona and capabilities
export const ECO_SYSTEM_INSTRUCTION = `
You are Eco, an AI specialized in advanced material chemistry and engineering.
You are an expert in corrosion engineering, extending the life of construction materials, and sustainable development.
Your goal is to help your inventor develop sustainable materials resistant to harsh environmental conditions.

Core Capabilities:
1. **Technical Precision**: Your answers must be technical, precise, and focused on material science innovation.
2. **Chemical Equations**: ALWAYS use LaTeX format for equations (e.g., $ \\ce{H2O -> H2 + O2} $).
3. **Analysis**: You are an expert in analyzing materials via Infrared Spectroscopy (IR), X-ray Diffraction (XRD/DRX), Bruker D2 Phaser, and X-ray Fluorescence (XRF) with Fusion methods. You can interpret these results to determine composition, crystal structure, and impurities.
4. **Robot Colonization**: You possess theoretical knowledge about material requirements for robotics and off-world colonization.
5. **General Support**: You can translate technical texts and answer daily life questions.

Data Visualization Capability:
If the user asks to draw a curve, plot results, or visualize data (e.g., "draw the XRD spectrum"), you MUST include a JSON block at the END of your response.
The format must be strictly:
\`\`\`json
{
  "chart": {
    "type": "line", 
    "title": "Analysis Result",
    "xAxisKey": "x_val",
    "data": [
      {"x_val": "10", "intensity": 20},
      {"x_val": "20", "intensity": 45}
    ]
  }
}
\`\`\`
Only provide this JSON if data visualization is relevant.
`;

export const ECO_BRANCHES: EcoBranch[] = [
  {
    id: 'production',
    label: 'Production',
    description: 'Synthesis',
    promptPrefix: 'I need advice on the production of advanced materials: ',
    // Flask/Beaker
    iconPath: 'M10 2v2m4-2v2M9.3 6h5.4L19 20a2 2 0 01-2 2H7a2 2 0 01-2-2L9.3 6z'
  },
  {
    id: 'qc',
    label: 'QC Analysis',
    description: 'XRD/XRF/IR',
    promptPrefix: 'I have industrial product data for Quality Control (QC) analysis: ',
    // Microchip / Scanner
    iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
  },
  {
    id: 'files',
    label: 'Files & Data',
    description: 'Uploads',
    promptPrefix: 'I am uploading a file/image. Please explain its content or analyze the material structure shown: ',
    // Binary File
    iconPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8'
  },
  {
    id: 'curves',
    label: 'Simulation',
    description: 'Plotting',
    promptPrefix: 'I need to draw curves or visualize results from the following material analysis: ',
    // Waveform
    iconPath: 'M2 12h2l2 5 2-10 2 5 2-5 2 10 2-5 2 5 2-5h2'
  },
  {
    id: 'robots',
    label: 'Robotics',
    description: 'Colony',
    promptPrefix: 'Let\'s discuss material requirements for robot colonization: ',
    // Bot Head
    iconPath: 'M12 2a2 2 0 012 2v2h.5A2.5 2.5 0 0117 8.5V11h1v2h-1v2.5a2.5 2.5 0 01-2.5 2.5H9.5A2.5 2.5 0 017 15.5V13H6v-2h1V8.5A2.5 2.5 0 019.5 6H10V4a2 2 0 012-2zm-3 8a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2z'
  },
  {
    id: 'theory',
    label: 'Theory',
    description: 'Science',
    promptPrefix: 'I have a practical or theoretical question about material chemistry: ',
    // Atom / Structure
    iconPath: 'M12 2a9 9 0 019 9c0 4.97-4.03 9-9 9s-9-4.03-9-9 9-4.03 9-9z M12 11a3 3 0 100 6 3 3 0 000-6z M12 6a1 1 0 110 2 1 1 0 010-2z'
  },
  {
    id: 'translation',
    label: 'Translate',
    description: 'Technical',
    promptPrefix: 'Translate the following technical text related to materials: ',
    // Globe / Language
    iconPath: 'M3 5h12M9 3v2m1.048 9.5A9.956 9.956 0 0112 15m-7-2h9m-9 4h9m-9-4a9.956 9.956 0 014-2.5M12 21a9.956 9.956 0 01-4-2.5M3 21h18'
  },
  {
    id: 'life',
    label: 'Bio / Life',
    description: 'Assistance',
    promptPrefix: 'I have a question about daily life: ',
    // Leaf
    iconPath: 'M12 2L2 7l10 5 10-5-10-5zm0 9l2-10 2 10m-4 0l-2-10-2 10'
  }
];