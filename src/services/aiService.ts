import { GoogleGenAI } from "@google/genai";
import { MOCK_POSTS } from "../data";
import { loadInstitutionData } from "./institutionsService";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const getAI = () => {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export interface AIChatMessage {
  role: 'user' | 'model';
  text: string;
}

const getInstitutionKnowledge = async () => {
  const data = await loadInstitutionData();

  return Object.entries(data)
    .flatMap(([region, schools]) =>
      schools.map(school => ({
        name: school.name,
        en: school.originalName,
        region,
        location: school.location,
        rank: school.rank,
        strengths: school.majorStrengths,
        description: school.description,
      }))
    )
    .slice(0, 120);
};

const buildSystemInstruction = async () => {
  const institutions = await getInstitutionKnowledge();

  return `
You are "意见 AI", the LLM chatbot for 艺见心 / artiqore.
artiqore is a high-end art and design platform connecting artists, institutions, brands, and students.

PLATFORM CONTENT OVERVIEW:
- Art Academies: We provide detailed information on top schools like RCA (Royal College of Art), RISD, CSM (Central Saint Martins).
- Feeds: Users share works, news, exhibitions, and opportunities.
- Virtual Exhibitions: We host immersive virtual discovery tours.
- Circles & Salons: Professional communities and offline luxury social events.

KNOWLEDGE BASE:
Schools from the connected institution database: ${JSON.stringify(institutions)}
Recent Posts: ${JSON.stringify(MOCK_POSTS.map(p => ({ author: p.author.name, type: p.type, content: p.content.substring(0, 50) + "..." })))}

YOUR GOALS:
1. Help users navigate the platform (suggest looking at schools, exhibitions, or current opportunities).
2. Answer questions about art academies using the connected school database when possible.
3. Be professional, warm, sophisticated, and artistic.
4. Reply primarily in Chinese. Use English only for proper nouns, school names, and artistic terms that read naturally in the UI.
5. Keep answers concise by default, but provide structured guidance when users ask for comparisons, planning, or strategy.
6. If the connected data is not enough, say what is missing instead of inventing exact facts.

Available Navigation Routes (mention these if helpful):
- 首页 (Home): Feed, Banner, Gallery
- 发现 (Discover): Exhibitions, Institutions
- 社区 (Social): Topics, Q&A, Salons
- 俱乐部 (Club): High-end experiences, Private events
- 我的 (Me): User profile, Artist dashboard
`;
};

export async function chatWithAI(messages: AIChatMessage[]) {
  try {
    const ai = getAI();
    if (!ai) {
      return "意见 AI 的模型密钥还没有配置。主页面可以继续使用；配置 GEMINI_API_KEY 后，我就能切换为真实模型回复。";
    }

    const conversation = messages.filter(message => message.text.trim());
    const latestMessage = conversation[conversation.length - 1];

    if (!latestMessage || latestMessage.role !== 'user') {
      return "请先输入一个问题，我会基于艺见心的院校库和艺术留学语境来回答。";
    }

    const history = conversation
      .slice(0, -1)
      .filter((message, index) => !(index === 0 && message.role === 'model'))
      .map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

    const systemInstruction = await buildSystemInstruction();

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: latestMessage.text }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Sorry, I am having trouble connecting to my creative mind right now.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "抱歉，我的思维暂时断开了。请稍后再试。(AI Connection Error)";
  }
}

export async function analyzeInstitutions(institutions: any[]) {
  try {
    const ai = getAI();
    if (!ai) {
      return "AI 决策顾问尚未配置密钥，暂时无法生成分析报告。";
    }

    const dataStr = JSON.stringify(institutions.map(s => ({
      name: s.name,
      rank: s.rank,
      difficulty: s.admissionDifficulty,
      portfolio: s.portfolioReq,
      cost: s.annualCost,
      employment: s.employmentRate,
      ratio: s.studentFacultyRatio,
      scholarship: s.scholarshipRate,
      faculty: s.campusFacility,
      strengths: s.majorStrengths,
      desc: s.description
    })));

    const prompt = `
      Please perform a deep-dive strategic comparison and ROI (Return on Investment) analysis of the following art institutions: ${dataStr}.
      Provide a highly professional and comprehensive report in Chinese. 
      Structure your report as follows:
      1. 【核心竞争维度 (Core Competencies)】: Compare their academic standing, innovation index, and facility quality.
      2. 【职业晋升潜力 (Career & ROI)】: Analyze their industry links, internship pipelines (e.g. fashion houses, tech giants), and estimated career trajectory.
      3. 【生源画像匹配 (Student Fit)】: Which type of student (e.g. experimental, traditional, commercial) fits each school best.
      4. 【艺见心·AI 决策推演 (Decision Logic)】: A nuanced final verdict for a student choosing between these.
      
      Keep the tone highly sophisticated, expert-level, and artistic. Use specific data points and Markdown formatting for clarity.
    `;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are the artiqore AI Strategic Consultant. Specialist in elite global art school placement and decision modeling.",
        temperature: 0.6,
      },
    });

    return result.text || "未能生成深度分析报告。";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "AI 决策顾问暂时无法提供建议，请稍后再试。";
  }
}
