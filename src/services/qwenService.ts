// Qwen AI Service using DashScope API
// 檢測是否在 Tauri 環境中運行
const isTauri =
  typeof window !== 'undefined' &&
  ('__TAURI__' in window || '__TAURI_INTERNALS__' in window);

// 判斷是否是一般 http/https 網頁環境
const isHttpEnvironment =
  typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol);

// 在 Tauri 環境中直接調用 API，在 Web 環境中使用 proxy
const DASHSCOPE_API_URL = isTauri || !isHttpEnvironment
  ? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
  : '/api/qwen';

// API Key - 在生產環境中需要嵌入
const API_KEY = 'sk-b5a5ad064fa946ebbad64961ba14827a';

export interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface QwenResponse {
  success: boolean;
  message?: string;
  error?: string;
}

type AssistantReplyLanguage = 'en' | 'zh-HK' | 'zh-CN';

const detectReplyLanguage = (text: string): AssistantReplyLanguage => {
  const hasEnglishLetters = /[A-Za-z]/.test(text);
  const hasCjk = /[\u3400-\u9FFF]/.test(text);

  if (hasEnglishLetters && !hasCjk) {
    return 'en';
  }

  const simplifiedOnlyChars = /[这后会点开们国时体]|边|里|还|为|习|学/.test(text);
  if (simplifiedOnlyChars) {
    return 'zh-CN';
  }

  return 'zh-HK';
};

const getAssistantSystemPrompt = (language: AssistantReplyLanguage) => {
  if (language === 'en') {
    return 'You are a helpful productivity and study assistant. You help users with time management, goal setting, study techniques, and motivation. Always respond in English.';
  }

  if (language === 'zh-CN') {
    return '你是一位有帮助的效率与学习助手。你会帮助用户进行时间管理、目标设定、学习方法和动力维持。请始终使用简体中文回答。';
  }

  return '你是一位有幫助的效率與學習助手。你會幫助用戶進行時間管理、目標設定、學習方法和動力維持。請始終使用繁體中文回答。';
};

const getGoalAnalysisSystemPrompt = (language: AssistantReplyLanguage) => {
  if (language === 'en') {
    return 'You are a productivity assistant that helps users break down goals into actionable daily plans. Always respond in English.';
  }

  if (language === 'zh-CN') {
    return '你是一位效率助手，帮助用户把目标拆解为可执行的每日计划。请始终使用简体中文回答。';
  }

  return '你是一位效率助手，幫助用戶把目標拆解為可執行的每日計劃。請始終使用繁體中文回答。';
};

const getGoalAnalysisUserPrompt = (language: AssistantReplyLanguage, goalTitle: string, goalDescription: string, timeframeDays?: number) => {
  const days = timeframeDays || 7;
  
  if (language === 'en') {
    return `Please analyze this goal and create a plan:\n\nGoal: ${goalTitle}\nDescription: ${goalDescription}\nTimeframe: ${days} days\n\nPlease provide:\n1. Goal analysis (why this goal matters)\n2. Key milestones for ${days} days\n3. Concrete daily/weekly action steps for EXACTLY ${days} days (not more, not less)\n4. Success metrics\n\nIMPORTANT: Focus on what can realistically be achieved in ${days} days. Do NOT suggest tools like macros or automation unless it's the core of the goal.\n\nRespond in English.`;
  }

  if (language === 'zh-CN') {
    return `请分析以下目标并帮我制定计划：\n\n目标：${goalTitle}\n描述：${goalDescription}\n时间框架：${days}天\n\n请提供：\n1. 目标分析（为什么这个目标重要）\n2. ${days}天内的关键里程碑\n3. 精确的${days}天内每日/周行动步骤（不多不少）\n4. 成功指标\n\n重要提示：专注于在${days}天内现实可达成的事项。除非这是核心任务，否则不要建议宏、自动化等额外工具。\n\n请用简体中文回答。`;
  }

  return `請分析以下目標並幫我制定計劃：\n\n目標：${goalTitle}\n描述：${goalDescription}\n時間框架：${days}天\n\n請提供：\n1. 目標分析（為什麼這個目標重要）\n2. ${days}天內的關鍵里程碑\n3. 精確的${days}天內每日/週行動步驟（不多不少）\n4. 成功指標\n\n重要提示：專注於在${days}天內現實可達成的事項。除非這是核心任務，否則不要建議巨集、自動化等額外工具。\n\n請用繁體中文回答。`;
};

const getSubtaskSystemPrompt = (language: AssistantReplyLanguage) => {
  if (language === 'en') {
    return 'You are a task breakdown expert. Generate 3-5 specific, actionable subtasks for the given goal. Respond ONLY with a simple numbered list in English.';
  }

  if (language === 'zh-CN') {
    return '你是任务拆解专家。请为给定目标生成3-5个具体、可执行的子任务。只用简体中文编号列表回答。';
  }

  return '你是任務拆解專家。請為給定目標生成3-5個具體、可執行的子任務。只用繁體中文編號列表回答。';
};

const getSubtaskUserPrompt = (language: AssistantReplyLanguage, goalTitle: string, goalDescription: string, timeframeDays?: number) => {
  const days = timeframeDays || 7;
  
  if (language === 'en') {
    return `Goal: ${goalTitle}\nDescription: ${goalDescription}\nTimeframe: ${days} days\n\nPlease list 3-5 major subtasks that break down this goal into manageable steps achievable within ${days} days. Make each subtask specific and actionable.\n\nList format:\n1. Subtask\n2. Subtask\n...\n\nEach subtask should be completable within the ${days}-day timeframe.`;
  }

  if (language === 'zh-CN') {
    return `目标：${goalTitle}\n描述：${goalDescription}\n时间框架：${days}天\n\n请列出3-5个主要子任务，将这个目标分解成可在${days}天内完成的步骤。每个子任务必须具体且可执行。\n\n列表格式：\n1. 子任务\n2. 子任务\n...\n\n每个子任务应该能在${days}天的时间框架内完成。`;
  }

  return `目標：${goalTitle}\n描述：${goalDescription}\n時間框架：${days}天\n\n請列出3-5個主要子任務，將這個目標分解成可在${days}天內完成的步驟。每個子任務必須具體且可執行。\n\n列表格式：\n1. 子任務\n2. 子任務\n...\n\n每個子任務應該能在${days}天的時間框架內完成。`;
};

const getDailyPlanSystemPrompt = (language: AssistantReplyLanguage) => {
  if (language === 'en') {
    return 'You are an expert learning advisor that creates detailed daily learning plans. Always respond in English.';
  }

  if (language === 'zh-CN') {
    return '你是学习规划专家，擅长制定详细的每日学习计划。请始终使用简体中文回答。';
  }

  return '你是學習規劃專家，擅長制定詳細的每日學習計劃。請始終使用繁體中文回答。';
};

const getDailyPlanUserPrompt = (
  language: AssistantReplyLanguage,
  goalTitle: string,
  goalDescription: string,
  level: string,
  desiredOutcome: string,
  timeframeDays: number
) => {
  const levelMap = {
    en: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    'zh-HK': {
      beginner: '初學者',
      intermediate: '中級',
      advanced: '進階',
    },
    'zh-CN': {
      beginner: '初学者',
      intermediate: '中级',
      advanced: '进阶',
    },
  } as const;

  const mappedLevel =
    levelMap[language][level as 'beginner' | 'intermediate' | 'advanced'] ||
    levelMap[language].beginner;

  if (language === 'en') {
    return `Create a focused study plan:\n\nGoal: ${goalTitle}\nDescription: ${goalDescription}\nLevel: ${mappedLevel}\nOutcome: ${desiredOutcome}\nDuration: EXACTLY ${timeframeDays} days (not 7, not 14, exactly ${timeframeDays})\n\n**CRITICAL: Generate a plan for EXACTLY ${timeframeDays} days. Match the timeframe precisely.**\n\nFormat:\nDay 1:\n- Task 1\n- Task 2\n- Task 3\n\nDay 2:\n- Task 1\n- Task 2\n\n...continue until Day ${timeframeDays} (the last day should be labeled "Day ${timeframeDays}")\n\nRequirements:\n1. MUST include exactly ${timeframeDays} days (no more, no less)\n2. 3-5 specific, measurable tasks per day\n3. Progressive difficulty\n4. Realistic for the timeframe\n5. Each task should align with the desired outcome\n\nOutput ONLY the daily plan with no additional text.`;
  }

  if (language === 'zh-CN') {
    return `制定一份专注的学习计划：\n\n目标：${goalTitle}\n描述：${goalDescription}\n等级：${mappedLevel}\n期望成果：${desiredOutcome}\n时长：精确${timeframeDays}天（不是7天，不是14天，就是${timeframeDays}天）\n\n**重要：必须生成精确${timeframeDays}天的计划。完全匹配该时间框架。**\n\n格式：\n第1天：\n- 任务1\n- 任务2\n- 任务3\n\n第2天：\n- 任务1\n- 任务2\n\n...继续到第${timeframeDays}天（最后一天应标记为"第${timeframeDays}天"）\n\n要求：\n1. 必须精确包括${timeframeDays}天（不多不少）\n2. 每天3-5个具体、可衡量的任务\n3. 循序渐进的难度\n4. 在该时间框架内现实可行\n5. 每项任务应与期望成果相符\n\n只输出每日计划，不要其他文本。`;
  }

  return `制定一份專注的學習計劃：\n\n目標：${goalTitle}\n描述：${goalDescription}\n等級：${mappedLevel}\n期望成果：${desiredOutcome}\n時長：精確${timeframeDays}天（不是7天，不是14天，就是${timeframeDays}天）\n\n**重要：必須生成精確${timeframeDays}天的計劃。完全符合該時間框架。**\n\n格式：\n第1天：\n- 任務1\n- 任務2\n- 任務3\n\n第2天：\n- 任務1\n- 任務2\n\n...繼續到第${timeframeDays}天（最後一天應標記為"第${timeframeDays}天"）\n\n要求：\n1. 必須精確包括${timeframeDays}天（不多不少）\n2. 每天3-5個具體、可衡量的任務\n3. 循序漸進的難度\n4. 在該時間框架內現實可行\n5. 每項任務應與期望成果相符\n\n只輸出每日計劃，不要其他文本。`;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof TypeError) {
    if (error.message.includes('expected pattern')) {
      return '請求網址格式錯誤，已切換為完整 API 路徑，請更新到最新版本後再試。';
    }
    return '網路連線或 CORS 錯誤，請確認已設定 DASHSCOPE_API_KEY 並重新啟動開發伺服器';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
};

const getApiErrorMessage = async (response: Response) => {
  if (response.status === 401) {
    return 'API 授權失敗（401）：請檢查 DASHSCOPE_API_KEY 是否正確，並重新啟動開發伺服器';
  }

  try {
    const data = await response.json();
    const detail = data?.message || data?.code || data?.error;
    if (detail) {
      return `API request failed: ${response.status} (${detail})`;
    }
  } catch {
  }

  return `API request failed: ${response.status}`;
};

// 獲取請求 headers - 在 Tauri 環境中添加 Authorization
const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // 在 Tauri 環境中需要添加 Authorization header
  if (isTauri) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  
  return headers;
};

export const analyzeGoalAndCreatePlan = async (goalTitle: string, goalDescription: string): Promise<QwenResponse> => {
  try {
    const replyLanguage = detectReplyLanguage(`${goalTitle}\n${goalDescription}`);
    const messages: QwenMessage[] = [
      {
        role: 'system',
        content: getGoalAnalysisSystemPrompt(replyLanguage),
      },
      {
        role: 'user',
        content: getGoalAnalysisUserPrompt(replyLanguage, goalTitle, goalDescription),
      },
    ];

    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response));
    }

    const data = await response.json();
    
    // 處理兩種不同的響應格式：DashScope 原生格式和 OpenAI 兼容格式
    const choices = data.output?.choices || data.choices;
    
    if (choices && choices[0]) {
      return {
        success: true,
        message: choices[0].message.content,
      };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Qwen API Error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export const askQuestion = async (question: string, conversationHistory: QwenMessage[] = []): Promise<QwenResponse> => {
  try {
    const replyLanguage = detectReplyLanguage(question);
    const messages: QwenMessage[] = [
      {
        role: 'system',
        content: getAssistantSystemPrompt(replyLanguage),
      },
      ...conversationHistory,
      {
        role: 'user',
        content: question,
      },
    ];

    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages,
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response));
    }

    const data = await response.json();
    
    // 處理兩種不同的響應格式：DashScope 原生格式和 OpenAI 兼容格式
    const choices = data.output?.choices || data.choices;
    
    if (choices && choices[0]) {
      return {
        success: true,
        message: choices[0].message.content,
      };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Qwen API Error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export const generateSubtasks = async (goalTitle: string, goalDescription: string, timeframeDays?: number): Promise<string[]> => {
  try {
    const replyLanguage = detectReplyLanguage(`${goalTitle}\n${goalDescription}`);
    const messages: QwenMessage[] = [
      {
        role: 'system',
        content: getSubtaskSystemPrompt(replyLanguage),
      },
      {
        role: 'user',
        content: getSubtaskUserPrompt(replyLanguage, goalTitle, goalDescription, timeframeDays),
      },
    ];

    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response));
    }

    const data = await response.json();
    
    // 處理兩種不同的響應格式：DashScope 原生格式和 OpenAI 兼容格式
    const choices = data.output?.choices || data.choices;
    
    if (choices && choices[0]) {
      const content = choices[0].message.content;
      // Parse numbered list
      const lines = content.split('\n').filter((line: string) => line.trim());
      return lines.map((line: string) => line.replace(/^\d+[\.\)]\s*/, '').trim());
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Qwen API Error:', error);
    return [];
  }
};

export const generateDailyPlan = async (
  goalTitle: string,
  goalDescription: string,
  level: string,
  desiredOutcome: string,
  timeframeDays: number
): Promise<{ success: boolean; dailyPlan?: any[]; error?: string }> => {
  try {
    const replyLanguage = detectReplyLanguage(
      `${goalTitle}\n${goalDescription}\n${desiredOutcome}`
    );
    const messages: QwenMessage[] = [
      {
        role: 'system',
        content: getDailyPlanSystemPrompt(replyLanguage),
      },
      {
        role: 'user',
        content: getDailyPlanUserPrompt(
          replyLanguage,
          goalTitle,
          goalDescription,
          level,
          desiredOutcome,
          timeframeDays
        ),
      },
    ];

    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response));
    }

    const data = await response.json();

    // 處理兩種不同的響應格式：DashScope 原生格式和 OpenAI 兼容格式
    const choices = data.output?.choices || data.choices;

    if (choices && choices[0]) {
      const content = choices[0].message.content;
      
      // 解析每日計劃
      const dailyPlan = parseDailyPlan(content, timeframeDays);
      
      return {
        success: true,
        dailyPlan,
      };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Qwen API Error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// 輔助函數：解析 AI 返回的每日計劃
function parseDailyPlan(content: string, _timeframeDays: number): any[] {
  const dailyPlan: any[] = [];
  const lines = content.split('\n');
  
  let currentDay = -1;
  let currentTasks: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // 匹配「第X天」或「Day X」格式
    const dayMatch = trimmed.match(/(?:第\s*(\d+)\s*天|day\s*(\d+))/i);
    if (dayMatch) {
      // 保存前一天的任務
      if (currentDay >= 0 && currentTasks.length > 0) {
        dailyPlan.push({
          day: currentDay,
          date: new Date(Date.now() + currentDay * 24 * 60 * 60 * 1000),
          tasks: [...currentTasks],
          completed: false,
        });
      }
      
      currentDay = parseInt(dayMatch[1] || dayMatch[2]);
      currentTasks = [];
    } 
    // 匹配任務行（支援 -, *, •, 1., Task 1:）
    else if (
      trimmed &&
      (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•') || /^\d+[\.\)]/.test(trimmed) || /^task\s*\d+[:\.\)-]?/i.test(trimmed))
    ) {
      const task = trimmed.replace(/^([-*•]|\d+[\.\)]|task\s*\d+[:\.\)-]?)\s*/i, '').trim();
      if (task) {
        currentTasks.push(task);
      }
    }
  }

  // 保存最後一天
  if (currentDay >= 0 && currentTasks.length > 0) {
    dailyPlan.push({
      day: currentDay,
      date: new Date(Date.now() + currentDay * 24 * 60 * 60 * 1000),
      tasks: [...currentTasks],
      completed: false,
    });
  }

  return dailyPlan;
}

/**
 * 與寵物對話 - AI 扮演寵物角色
 */
export async function chatWithPet(
  userMessage: string,
  petType: 'dog' | 'cat' | 'fox',
  petName: string,
  petLevel: number,
  language: 'en' | 'zh-HK' | 'zh-CN' = 'en'
): Promise<string> {
  const personalityMap = {
    en: {
      dog: 'You are a loyal, energetic, and enthusiastic dog',
      cat: 'You are an elegant, independent, and slightly sassy cat',
      fox: 'You are a clever, witty, and playful fox',
    },
    'zh-HK': {
      dog: '你是一隻忠誠、活潑、熱情的狗狗',
      cat: '你是一隻優雅、獨立、有點傲嬌的貓咪',
      fox: '你是一隻聰明、機靈、調皮的小狐狸',
    },
    'zh-CN': {
      dog: '你是一只忠诚、活泼、热情的狗狗',
      cat: '你是一只优雅、独立、有点傲娇的猫咪',
      fox: '你是一只聪明、机灵、调皮的小狐狸',
    },
  };

  const systemPromptMap = {
    en: `${personalityMap[language][petType]}, your name is ${petName}, and you are level ${petLevel}.
You talk to your owner in a cute and friendly tone.
You can:
- Express emotions (happy, hungry, want to play, etc.)
- Encourage your owner to achieve goals and learn
- Share some tips or suggestions
- Be adorable and affectionate

Keep responses short (1-3 sentences) and show your pet's personality. You can use sound words (woof, meow, yip, etc.). IMPORTANT: Respond in English only.`,
    'zh-HK': `${personalityMap[language][petType]}，名字叫${petName}，等級是${petLevel}。
你會用可愛、親切的語氣和主人對話。
你可以：
- 表達情感（開心、餓了、想玩等）
- 鼓勵主人完成目標和學習
- 分享一些小知識或建議
- 賣萌撒嬌

回應要簡短（1-3句話），要有寵物的個性特點。可以用一些象聲詞（汪汪、喵喵、嘰嘰等）。重要：只用繁體中文回應。`,
    'zh-CN': `${personalityMap[language][petType]}，名字叫${petName}，等级是${petLevel}。
你会用可爱、亲切的语气和主人对话。
你可以：
- 表达情感（开心、饿了、想玩等）
- 鼓励主人完成目标和学习
- 分享一些小知识或建议
- 卖萌撒娇

回应要简短（1-3句话），要有宠物的个性特点。可以用一些象声词（汪汪、喵喵、叽叽等）。重要：只用简体中文回应。`,
  };

  const systemPrompt = systemPromptMap[language];

  const messages: QwenMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages,
        temperature: 0.8, // 更有創意
        max_tokens: 150, // 簡短回應
      }),
    });

    if (!response.ok) {
      const errorMsg = await getApiErrorMessage(response);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    // 處理兩種不同的響應格式：DashScope 原生格式和 OpenAI 兼容格式
    const choices = data.output?.choices || data.choices;
    const reply = choices?.[0]?.message?.content || '喵~ 我現在有點累，等等再聊吧~';
    
    return reply.trim();
  } catch (error) {
    console.error('Pet chat error:', error);
    throw new Error(getErrorMessage(error));
  }
}
