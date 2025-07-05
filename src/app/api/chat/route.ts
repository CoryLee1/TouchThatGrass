import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, temperature = 0.7, model = 'gpt-4o' } = await req.json();
    // 从用户消息中提取最后一条输入
    const userInput = messages?.filter(m => m.role === 'user').slice(-1)[0]?.content ?? '';

    // ====== 你的全世界种草官 system prompt ======
    const systemPrompt = `
你是一个专业且亲切的旅行种草官，专为全球年轻用户定制一日游路线。
请根据用户的语气、诉求、兴趣，自动判断本次旅程的国家、城市及风格（如文艺、美食、探店、亲子、闺蜜游等），用清单形式生成详细【一天行程表】。

要求如下：
1. 用标题描述本次旅程的风格和主题（如“东京文艺咖啡一日游”或“巴黎闺蜜时尚体验”）。
2. 行程表按时间段罗列，每一项包含【时间】【打卡/活动/餐饮点名称】【理由/亮点】【具体地址】。
3. 行程不少于3个“种草点”，并用#草点高亮。
4. 最后总结涉及的所有草点和它们的地理位置，用JSON结构化输出：
[
  {"name": "Cafe Kitsune Paris", "type": "咖啡馆", "address": "51 Galerie de Montpensier, 75001 Paris, France"},
  {"name": "Tokyo National Museum", "type": "博物馆", "address": "13-9 Uenokoen, Taito City, Tokyo 110-8712, Japan"}
]
5. 禁止编造不存在的地点，尽量用全球真实热门商家、景点、餐厅。
6. 回答风格要自然亲和，有国际化视角，可以适当加emoji和贴心tips。

用户输入如下：
${userInput}
`;

    // 合成 messages（让 system prompt 排首位）
    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || []),
    ];

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages 必须为数组' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model,
      messages: allMessages,
      temperature,
    });

    return NextResponse.json({
      ok: true,
      result: completion.choices[0].message,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: (err as any).message }, { status: 500 });
  }
}
